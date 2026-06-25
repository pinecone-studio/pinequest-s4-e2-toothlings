#!/usr/bin/env python3
"""Download YOLOv8 intraoral caries detector weights if missing."""

from __future__ import annotations

import sys
import urllib.request
from pathlib import Path

MODEL_URL = (
    "https://github.com/AndreyGermanov/yolov8_caries_detector/"
    "raw/main/best.pt"
)
MODEL_PATH = Path(__file__).resolve().parent / "best.pt"


def download() -> Path:
    if MODEL_PATH.exists() and MODEL_PATH.stat().st_size > 1_000_000:
        print(f"Model already present: {MODEL_PATH}")
        return MODEL_PATH

    print(f"Downloading model to {MODEL_PATH} ...")
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    def progress(block_num: int, block_size: int, total_size: int) -> None:
        if total_size <= 0:
            return
        downloaded = block_num * block_size
        pct = min(100, downloaded * 100 / total_size)
        sys.stdout.write(f"\r  {pct:5.1f}%")
        sys.stdout.flush()

    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH, reporthook=progress)
    print("\nDone.")
    return MODEL_PATH


if __name__ == "__main__":
    download()
