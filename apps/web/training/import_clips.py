#!/usr/bin/env python3
"""
Import a browser-exported dataset (brush-dataset-*.json from /brush/collect)
into data/raw/<label>/<clip>.npz for training.

Usage:
    python3 import_clips.py ~/Downloads/brush-dataset-2026-06-29.json [more.json ...]
    python3 import_clips.py ~/Downloads/brush-dataset-*.json --reset
"""
from __future__ import annotations

import glob
import json
import os
import sys

import numpy as np

import config as C


def _clip_to_arrays(clip: dict) -> tuple[np.ndarray, np.ndarray]:
    samples = clip.get("samples", [])
    rows = np.array(
        [
            [
                s["t"], s["qw"], s["qx"], s["qy"], s["qz"],
                s["yaw"], s["pitch"], s["roll"],
                s["gx"], s["gy"], s["gz"], s["ax"], s["ay"], s["az"],
            ]
            for s in samples
        ],
        dtype=np.float64,
    )
    ref = clip.get("refQuat", {"w": 1, "x": 0, "y": 0, "z": 0})
    ref_arr = np.array([ref["w"], ref["x"], ref["y"], ref["z"]], dtype=np.float64)
    return rows, ref_arr


def import_file(path: str) -> int:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    clips = data.get("clips", [])
    n = 0
    for clip in clips:
        label = clip.get("label")
        if not label:
            continue
        rows, ref = _clip_to_arrays(clip)
        if rows.ndim != 2 or rows.shape[0] < C.MIN_WINDOW_FRAMES:
            continue
        out_dir = os.path.join(C.RAW_DIR, C.safe_name(label))
        os.makedirs(out_dir, exist_ok=True)
        cid = clip.get("id", f"{label}_{n}")
        out_path = os.path.join(out_dir, f"{C.safe_name(str(cid))}.npz")
        np.savez_compressed(out_path, samples=rows, ref=ref)
        n += 1
    return n


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    reset = "--reset" in sys.argv[1:]
    if not args:
        sys.exit("Хэрэглээ: python3 import_clips.py brush-dataset-*.json [--reset]")

    if reset and os.path.isdir(C.RAW_DIR):
        import shutil

        shutil.rmtree(C.RAW_DIR)
        print(f"× data/raw цэвэрлэв")

    paths: list[str] = []
    for a in args:
        paths.extend(sorted(glob.glob(os.path.expanduser(a))))
    if not paths:
        sys.exit("Файл олдсонгүй.")

    total = 0
    for p in paths:
        c = import_file(p)
        total += c
        print(f"  {os.path.basename(p)}: {c} clip")

    # Per-label summary
    if os.path.isdir(C.RAW_DIR):
        print("\nClip / label:")
        for lbl in C.load_labels():
            d = os.path.join(C.RAW_DIR, C.safe_name(lbl))
            cnt = len(glob.glob(os.path.join(d, "*.npz"))) if os.path.isdir(d) else 0
            flag = "" if cnt >= 5 else "  ⚠ дутуу (≥5 санал болгоно)"
            print(f"  {lbl:14s} {cnt}{flag}")

    print(f"\n✓ Нийт {total} clip импортлов → python3 train.py")


if __name__ == "__main__":
    main()
