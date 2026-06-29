#!/usr/bin/env python3
"""
Export artifacts/model.keras → ../public/models/brush (TFJS layers format).

Run after train.py (train.py also calls this automatically):
    source .venv/bin/activate
    pip install -r requirements-export.txt
    python3 export_model.py
"""
from __future__ import annotations

import os
import sys

os.environ.pop("TF_USE_LEGACY_KERAS", None)

import config as C


def _load_keras_model(path: str):
    try:
        import keras

        return keras.models.load_model(path, compile=False)
    except Exception:
        import tensorflow as tf

        return tf.keras.models.load_model(path, compile=False)


def export_keras_to_tfjs(keras_path: str, out_dir: str) -> None:
    if not os.path.isfile(keras_path):
        raise FileNotFoundError(f"{keras_path} олдсонгүй — эхлээд python3 train.py")
    os.makedirs(out_dir, exist_ok=True)

    model = _load_keras_model(keras_path)
    h5_path = os.path.join(C.ARTIFACTS_DIR, "model.h5")
    model.save(h5_path)

    import tensorflowjs as tfjs
    from tensorflowjs.converters import keras_h5_conversion as conv

    topology, weight_groups = conv.h5_merged_saved_model_to_tfjs_format(h5_path)
    conv.write_artifacts(topology, weight_groups, out_dir)
    _ = tfjs  # ensure import side effects loaded


def main() -> None:
    keras_path = os.path.join(C.ARTIFACTS_DIR, "model.keras")
    print(f"→ Converting {keras_path} → {C.WEB_MODEL_DIR}")
    try:
        export_keras_to_tfjs(keras_path, C.WEB_MODEL_DIR)
    except Exception as e:  # noqa: BLE001
        sys.exit(f"❌ Export алдаа: {e}")
    print(f"✓ TFJS бэлэн: {C.WEB_MODEL_DIR}")
    print("  cd .. && pnpm dev → /brush?tab=monitor")


if __name__ == "__main__":
    main()
