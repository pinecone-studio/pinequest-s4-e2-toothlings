"""
Single source of truth for the brushing-zone recognizer (Python side).

CRITICAL: every constant that affects the per-frame feature vector or the
window must be mirrored EXACTLY in the web client:
  - features.py            <->  apps/web/src/lib/brush/featureContract.ts
  - SEQ_LEN / WINDOW_SEC   <->  apps/web/src/lib/brush/config.ts
Change one, change both, then retrain + re-export.
"""
from __future__ import annotations

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))      # apps/web/training
WEB_DIR = os.path.dirname(BASE_DIR)                          # apps/web
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DIR = os.path.join(DATA_DIR, "raw")                      # data/raw/<label>/<clip>.npz
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
LABELS_FILE = os.path.join(BASE_DIR, "labels.txt")

# Exported TFJS model served by the web app (and reused by mobile).
WEB_MODEL_DIR = os.path.join(WEB_DIR, "public", "models", "brush")

# =========================================================================
# LABELS  (mirror apps/web/src/lib/brush/zones.ts BRUSH_LABELS)
# =========================================================================
QUADRANTS = ["UL", "UR", "LL", "LR"]
SURFACES = ["outer", "inner", "occlusal"]
IDLE_LABEL = "idle"

BRUSH_LABELS = [f"{q}-{s}" for q in QUADRANTS for s in SURFACES] + [IDLE_LABEL]
N_LABELS = len(BRUSH_LABELS)   # 13

# =========================================================================
# FEATURE / WINDOW  (mirror featureContract.ts + config.ts)
# =========================================================================
FEATURE_DIM = 11
GYRO_SCALE = 250.0
ACCEL_SCALE = 2.0

SEQ_LEN = 32
WINDOW_SEC = 1.3
WINDOW_STRIDE_SEC = 0.25   # sliding step when slicing windows from a clip
MIN_WINDOW_FRAMES = 8

# Raw clip column layout written by record.py (.npz "samples").
#   t, qw, qx, qy, qz, yaw, pitch, roll, gx, gy, gz, ax, ay, az
RAW_COLS = [
    "t", "qw", "qx", "qy", "qz", "yaw", "pitch", "roll",
    "gx", "gy", "gz", "ax", "ay", "az",
]
RAW_DIM = len(RAW_COLS)  # 14

# =========================================================================
# TRAINING
# =========================================================================
VAL_SPLIT = 0.2
BATCH_SIZE = 64
EPOCHS = 120
LEARNING_RATE = 1e-3
SEED = 42

AUG_PER_WINDOW = 4   # synthetic variants per real window

# Live emitter (exported into metadata.json → web client).
LIVE_MIN_CONFIDENCE = 0.6
LIVE_MIN_STREAK = 2


def safe_name(label: str) -> str:
    return label.replace("/", "_").replace(" ", "_") or "label"


def load_labels() -> list[str]:
    """labels.txt overrides the canonical order if present (1 label/line)."""
    if not os.path.isfile(LABELS_FILE):
        return list(BRUSH_LABELS)
    out: list[str] = []
    with open(LABELS_FILE, encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith("#"):
                continue
            if s not in out:
                out.append(s)
    if IDLE_LABEL not in out:
        out.append(IDLE_LABEL)
    return out
