"""
Train the brushing-zone temporal recognizer and export to TensorFlow.js.

Model: BatchNorm → Conv1D proj → 3× dilated TCN blocks → GAP → Dense → softmax.
Input:  (SEQ_LEN, FEATURE_DIM) IMU feature window.
Output: probability over BRUSH_LABELS (incl. 'idle').

Run:
    cd apps/web/training
    python3 -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    python3 record.py --url ws://172.27.221.251:81   # collect clips
    python3 train.py

Outputs:
    artifacts/model.keras, artifacts/report.txt
    ../public/models/brush/   (TFJS model.json + weights + metadata.json)
"""
from __future__ import annotations

import json
import os

import numpy as np

import config as C
from dataset import build_dataset


def _tcn_block(x, filters, kernel, dilation, dropout, layers):
    res = x
    x = layers.Conv1D(filters, kernel, padding="same", dilation_rate=dilation,
                      activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(dropout)(x)
    x = layers.Conv1D(filters, kernel, padding="same", dilation_rate=dilation,
                      activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(dropout)(x)
    if res.shape[-1] != filters:
        res = layers.Conv1D(filters, 1, padding="same")(res)
    return layers.Add()([x, res])


def _label_smoothing_loss(epsilon=0.06):
    import tensorflow as tf

    def loss(y_true, y_pred):
        n = tf.cast(tf.shape(y_pred)[-1], tf.float32)
        y = tf.one_hot(tf.cast(y_true, tf.int32), tf.shape(y_pred)[-1])
        y = tf.cast(y, y_pred.dtype) * (1.0 - epsilon) + epsilon / n
        return tf.keras.losses.categorical_crossentropy(y, y_pred)

    return loss


def build_model(n_classes: int):
    import tensorflow as tf
    from tensorflow.keras import layers, models

    inp = layers.Input(shape=(C.SEQ_LEN, C.FEATURE_DIM), name="sequence")
    x = layers.BatchNormalization()(inp)
    x = layers.Conv1D(48, 1, padding="same", activation="relu")(x)
    x = _tcn_block(x, 48, 3, 1, 0.15, layers)
    x = _tcn_block(x, 72, 3, 2, 0.20, layers)
    x = _tcn_block(x, 96, 3, 4, 0.25, layers)
    x = layers.GlobalAveragePooling1D()(x)
    x = layers.Dense(72, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    out = layers.Dense(n_classes, activation="softmax", name="probs")(x)

    model = models.Model(inp, out)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(C.LEARNING_RATE),
        loss=_label_smoothing_loss(),
        metrics=["accuracy"],
    )
    return model


def class_weights(y, n_classes, labels):
    counts = np.bincount(y, minlength=n_classes).astype(np.float64)
    counts[counts == 0] = 1.0
    w = counts.sum() / (n_classes * counts)
    out = {i: float(w[i]) for i in range(n_classes)}
    for i, lbl in enumerate(labels):
        if lbl == C.IDLE_LABEL:
            out[i] *= 1.5  # idle must be reliable to suppress false coverage
    return out


def evaluate(model, X_va, y_va, labels) -> str:
    if len(X_va) == 0:
        return "validation set хоосон"
    probs = model.predict(X_va, verbose=0)
    pred = probs.argmax(axis=1)
    lines = [f"val accuracy: {float((pred == y_va).mean()):.4f}  (n={len(y_va)})", ""]
    n = len(labels)
    cm = np.zeros((n, n), dtype=int)
    for t, p in zip(y_va, pred):
        cm[t, p] += 1
    lines.append("per-class recall:")
    for i, lbl in enumerate(labels):
        tot = cm[i].sum()
        rec = cm[i, i] / tot if tot else 0.0
        wrong = sorted(
            [(labels[j], cm[i, j]) for j in range(n) if j != i and cm[i, j] > 0],
            key=lambda kv: -kv[1],
        )[:3]
        conf = "  ← " + ", ".join(f"{w}:{c}" for w, c in wrong) if wrong else ""
        lines.append(f"  {lbl:14s} {rec:5.2f} ({cm[i, i]}/{tot}){conf}")
    return "\n".join(lines)


def write_metadata(labels: list[str]) -> None:
    os.makedirs(C.WEB_MODEL_DIR, exist_ok=True)
    meta = {
        "labels": labels,
        "idleLabel": C.IDLE_LABEL,
        "seqLen": C.SEQ_LEN,
        "featureDim": C.FEATURE_DIM,
        "windowSec": C.WINDOW_SEC,
        "gyroScale": C.GYRO_SCALE,
        "accelScale": C.ACCEL_SCALE,
        "minLiveConfidence": C.LIVE_MIN_CONFIDENCE,
        "minStreak": C.LIVE_MIN_STREAK,
    }
    with open(os.path.join(C.WEB_MODEL_DIR, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)


def export_tfjs(model, labels: list[str]) -> None:
    write_metadata(labels)
    try:
        from export_model import export_keras_to_tfjs

        keras_path = os.path.join(C.ARTIFACTS_DIR, "model.keras")
        export_keras_to_tfjs(keras_path, C.WEB_MODEL_DIR)
        print(f"✓ TFJS export → {C.WEB_MODEL_DIR}")
    except Exception as e:  # noqa: BLE001
        print(f"⚠ TFJS export алгассан: {e}\n  python3 export_model.py гараар ажиллуулна уу.")


def main() -> None:
    import tensorflow as tf

    tf.random.set_seed(C.SEED)
    X_tr, y_tr, X_va, y_va, labels, counts = build_dataset()
    print("labels:", labels)
    print("clips/label:", counts)
    print("train:", X_tr.shape, "val:", X_va.shape)

    n_classes = len(labels)
    model = build_model(n_classes)
    model.summary()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy" if len(X_va) else "accuracy",
            patience=16, restore_best_weights=True, mode="max"),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss" if len(X_va) else "loss",
            factor=0.5, patience=6, min_lr=1e-5),
    ]
    model.fit(
        X_tr, y_tr,
        validation_data=(X_va, y_va) if len(X_va) else None,
        epochs=C.EPOCHS,
        batch_size=C.BATCH_SIZE,
        class_weight=class_weights(y_tr, n_classes, labels),
        callbacks=callbacks,
        verbose=2,
    )

    os.makedirs(C.ARTIFACTS_DIR, exist_ok=True)
    model.save(os.path.join(C.ARTIFACTS_DIR, "model.keras"))

    report = evaluate(model, X_va, y_va, labels)
    print("\n" + report)
    with open(os.path.join(C.ARTIFACTS_DIR, "report.txt"), "w", encoding="utf-8") as f:
        f.write(report + "\n")

    export_tfjs(model, labels)
    print("\nДууслаа. Web дээр /brush?tab=monitor — refresh хийгээд угааж эхэлнэ.")


if __name__ == "__main__":
    main()
