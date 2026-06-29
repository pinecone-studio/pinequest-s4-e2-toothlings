"""
Build training tensors from recorded clips.

- Loads clips from data/raw/<label>/<clip>.npz  (samples:(N,RAW_DIM), ref:(4,))
- Slides a WINDOW_SEC window (stride WINDOW_STRIDE_SEC) over each clip.
- Resamples each window to SEQ_LEN frames (time-linear interp) → features.
- Splits by CLIP (never by window) to avoid leakage.
- Augments TRAINING windows (gyro/accel noise, yaw offset, time scale).
"""
from __future__ import annotations

import os

import numpy as np

import config as C
import features as F

rng = np.random.default_rng(C.SEED)


def _label_from_dir(safe_dir: str) -> str:
    table = {C.safe_name(l): l for l in C.load_labels()}
    return table.get(safe_dir, safe_dir)


def load_clips() -> list[tuple[np.ndarray, np.ndarray, str]]:
    """Returns list of (samples (N,RAW_DIM), ref_quat (4,), label)."""
    clips: list[tuple[np.ndarray, np.ndarray, str]] = []
    if not os.path.isdir(C.RAW_DIR):
        return clips
    for label_dir in sorted(os.listdir(C.RAW_DIR)):
        d = os.path.join(C.RAW_DIR, label_dir)
        if not os.path.isdir(d):
            continue
        label = _label_from_dir(label_dir)
        for name in sorted(os.listdir(d)):
            if not name.endswith(".npz"):
                continue
            data = np.load(os.path.join(d, name))
            samples = data["samples"].astype(np.float64)
            ref = data["ref"].astype(np.float64) if "ref" in data else np.array([1, 0, 0, 0.0])
            if samples.ndim != 2 or samples.shape[1] != C.RAW_DIM:
                continue
            clips.append((samples, ref, label))
    return clips


def resample_time(window: np.ndarray, times: np.ndarray, target: int) -> np.ndarray:
    """window: (M, D), times: (M,) ms → (target, D) linear interp."""
    m = window.shape[0]
    if m == target:
        return window.astype(np.float32)
    if m == 1:
        return np.repeat(window, target, axis=0).astype(np.float32)
    t0, t1 = times[0], times[-1]
    span = (t1 - t0) or 1.0
    dst = t0 + span * np.linspace(0, 1, target)
    out = np.empty((target, window.shape[1]), dtype=np.float32)
    for d in range(window.shape[1]):
        out[:, d] = np.interp(dst, times, window[:, d])
    return out


def _windows_from_clip(samples: np.ndarray) -> list[np.ndarray]:
    """Slice [start, start+WINDOW_SEC] windows by timestamp."""
    times = samples[:, 0]
    if times[-1] <= times[0]:
        return [samples] if samples.shape[0] >= C.MIN_WINDOW_FRAMES else []
    win_ms = C.WINDOW_SEC * 1000.0
    step_ms = C.WINDOW_STRIDE_SEC * 1000.0
    out: list[np.ndarray] = []
    start = times[0]
    end_of_clip = times[-1]
    while start <= end_of_clip - win_ms * 0.5:
        mask = (times >= start) & (times <= start + win_ms)
        win = samples[mask]
        if win.shape[0] >= C.MIN_WINDOW_FRAMES:
            out.append(win)
        start += step_ms
    if not out and samples.shape[0] >= C.MIN_WINDOW_FRAMES:
        out.append(samples)
    return out


def _augment_raw(win: np.ndarray) -> np.ndarray:
    out = win.copy()
    # gyro noise (deg/s)
    out[:, 8:11] += rng.normal(0, 6.0, out[:, 8:11].shape)
    # accel noise (g)
    out[:, 11:14] += rng.normal(0, 0.02, out[:, 11:14].shape)
    return out


def _yaw_offset_ref(ref: np.ndarray) -> np.ndarray:
    """Rotate the calibration ref by a small random yaw — simulates imperfect
    'Тэгшлэх'. Keeps left/right learnable but robust to a few degrees of error."""
    deg = rng.uniform(-12, 12)
    half = np.radians(deg) / 2
    yaw_q = np.array([np.cos(half), 0, 0, np.sin(half)])
    return F.quat_mul(ref.reshape(1, 4), yaw_q.reshape(1, 4))[0]


def build_dataset():
    clips = load_clips()
    if not clips:
        raise SystemExit(
            "Clip алга. Эхлээд дата цуглуул: python3 record.py --url ws://<esp32-ip>:81"
        )

    labels = C.load_labels()
    label_to_id = {l: i for i, l in enumerate(labels)}

    by_label: dict[str, list[int]] = {l: [] for l in labels}
    for i, (_, _, lbl) in enumerate(clips):
        by_label.setdefault(lbl, []).append(i)

    X_tr, y_tr, X_va, y_va = [], [], [], []

    for lbl, idxs in by_label.items():
        if lbl not in label_to_id:
            continue
        cid = label_to_id[lbl]
        order = list(idxs)
        rng.shuffle(order)
        n_val = max(1, int(len(order) * C.VAL_SPLIT)) if len(order) > 2 else 0
        val_ids = set(order[:n_val])

        for ci in idxs:
            samples, ref, _ = clips[ci]
            is_val = ci in val_ids
            for win in _windows_from_clip(samples):
                times = win[:, 0]
                base_feat = F.extract_features(win, ref)
                base = resample_time(base_feat, times, C.SEQ_LEN)
                if is_val:
                    X_va.append(base)
                    y_va.append(cid)
                    continue
                X_tr.append(base)
                y_tr.append(cid)
                for _ in range(C.AUG_PER_WINDOW):
                    aug_ref = _yaw_offset_ref(ref)
                    feat = F.extract_features(_augment_raw(win), aug_ref)
                    X_tr.append(resample_time(feat, times, C.SEQ_LEN))
                    y_tr.append(cid)

    X_tr = np.asarray(X_tr, dtype=np.float32)
    y_tr = np.asarray(y_tr, dtype=np.int64)
    X_va = np.asarray(X_va, dtype=np.float32)
    y_va = np.asarray(y_va, dtype=np.int64)

    perm = rng.permutation(len(X_tr))
    X_tr, y_tr = X_tr[perm], y_tr[perm]

    counts = {l: len(by_label.get(l, [])) for l in labels}
    return X_tr, y_tr, X_va, y_va, labels, counts


if __name__ == "__main__":
    Xtr, ytr, Xva, yva, names, counts = build_dataset()
    print("labels:", names)
    print("clips/label:", counts)
    print("train:", Xtr.shape, "val:", Xva.shape)
