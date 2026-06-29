#!/usr/bin/env python3
"""
Clip recorder — connect to the ESP32 brush over WebSocket and record short
labelled clips DIRECTLY into the project (data/raw/<label>/<clip>.npz), exactly
like seq/training/record.py but reading the IMU stream instead of a camera.

No browser involved. Web/mobile only ever RUN the trained model.

Install:
    pip install -r requirements.txt        # numpy + websocket-client

Run:
    python3 record.py --url ws://172.27.221.251:81
    python3 record.py 172.27.221.251       # bare IP also works

Controls (type then Enter):
    <Enter> / r   record one CLIP_SECONDS clip for the current label
    <number>      switch to label by its number
    n / p         next / previous label
    c             calibrate (current orientation → yaw reference)
    d             delete the most recent clip of the current label
    s             show clip counts
    q             quit

Saved: data/raw/<safe_label>/<label>_<timestamp>.npz
       arrays: samples (N, RAW_DIM)  +  ref (4,)  [w,x,y,z]
"""
from __future__ import annotations

import json
import os
import sys
import threading
import time
from datetime import datetime

import numpy as np

import config as C

try:
    import websocket  # websocket-client
except ImportError:
    sys.exit("❌ websocket-client алга. Суулга: pip install -r requirements.txt")


# ----------------------------------------------------------------- WS client
class BrushStream:
    """Background WebSocket reader. Keeps the latest sample; buffers on demand."""

    def __init__(self, url: str) -> None:
        self.url = url
        self.latest: list[float] | None = None
        self.recording = False
        self.buffer: list[list[float]] = []
        self.connected = False
        self._lock = threading.Lock()
        self._ws: websocket.WebSocketApp | None = None

    def _on_message(self, _ws, message: str) -> None:
        try:
            d = json.loads(message)
        except (json.JSONDecodeError, TypeError):
            return
        row = [
            time.time() * 1000.0,
            float(d.get("qw", 1.0)), float(d.get("qx", 0.0)),
            float(d.get("qy", 0.0)), float(d.get("qz", 0.0)),
            float(d.get("y", 0.0)), float(d.get("p", 0.0)), float(d.get("r", 0.0)),
            float(d.get("gx", 0.0)), float(d.get("gy", 0.0)), float(d.get("gz", 0.0)),
            float(d.get("ax", 0.0)), float(d.get("ay", 0.0)), float(d.get("az", 0.0)),
        ]
        with self._lock:
            self.latest = row
            if self.recording:
                self.buffer.append(row)

    def _on_open(self, _ws) -> None:
        self.connected = True
        print(f"✓ Холбогдлоо: {self.url}")

    def _on_close(self, _ws, *_args) -> None:
        self.connected = False

    def _on_error(self, _ws, err) -> None:
        print(f"⚠ WS алдаа: {err}")

    def start(self) -> None:
        self._ws = websocket.WebSocketApp(
            self.url,
            on_message=self._on_message,
            on_open=self._on_open,
            on_close=self._on_close,
            on_error=self._on_error,
        )
        t = threading.Thread(target=self._ws.run_forever, daemon=True)
        t.start()

    def record_clip(self, seconds: float) -> np.ndarray:
        with self._lock:
            self.buffer = []
            self.recording = True
        time.sleep(seconds)
        with self._lock:
            self.recording = False
            rows = list(self.buffer)
            self.buffer = []
        return np.asarray(rows, dtype=np.float64)

    def latest_quat(self) -> np.ndarray:
        with self._lock:
            row = self.latest
        if row is None:
            return np.array([1.0, 0.0, 0.0, 0.0])
        q = np.array(row[1:5])
        n = np.linalg.norm(q)
        if n < 1e-8:
            return np.array([1.0, 0.0, 0.0, 0.0])
        q = q / n
        return q * (-1.0 if q[0] < 0 else 1.0)


# ----------------------------------------------------------------- helpers
def _counts() -> dict[str, int]:
    out: dict[str, int] = {}
    for lbl in C.load_labels():
        d = os.path.join(C.RAW_DIR, C.safe_name(lbl))
        out[lbl] = len([f for f in os.listdir(d) if f.endswith(".npz")]) if os.path.isdir(d) else 0
    return out


def _print_labels(labels: list[str], idx: int) -> None:
    counts = _counts()
    print("\n──────── Labels ────────")
    for i, lbl in enumerate(labels):
        mark = "►" if i == idx else " "
        c = counts.get(lbl, 0)
        flag = "✓" if c >= 12 else ""
        print(f" {mark} [{i:2d}] {lbl:14s} {c:3d} {flag}")
    print("────────────────────────")


def _normalize_url(arg: str) -> str:
    if arg.startswith("ws://") or arg.startswith("wss://"):
        return arg
    return f"ws://{arg}:81"


# ----------------------------------------------------------------- main
def main() -> None:
    args = sys.argv[1:]
    url = "ws://172.27.221.251:81"
    for i, a in enumerate(args):
        if a == "--url" and i + 1 < len(args):
            url = _normalize_url(args[i + 1])
        elif not a.startswith("--"):
            url = _normalize_url(a)

    labels = C.load_labels()
    idx = 0
    ref = np.array([1.0, 0.0, 0.0, 0.0])
    last_saved: str | None = None

    stream = BrushStream(url)
    stream.start()
    print(f"→ {url} руу холбогдож байна… (ESP32 асаалттай, ижил Wi-Fi-д байх ёстой)")
    time.sleep(1.5)

    _print_labels(labels, idx)
    print(f"\nclip урт = {C.CLIP_SECONDS}s. <Enter>=бичих, c=тэгшлэх, n/p, тоо, d, s, q\n")

    while True:
        try:
            cmd = input(f"[{labels[idx]}] > ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nГарлаа.")
            return

        if cmd in ("q", "quit"):
            print("Гарлаа.")
            return
        if cmd in ("n",):
            idx = (idx + 1) % len(labels)
            _print_labels(labels, idx)
            continue
        if cmd in ("p",):
            idx = (idx - 1) % len(labels)
            _print_labels(labels, idx)
            continue
        if cmd in ("s",):
            _print_labels(labels, idx)
            continue
        if cmd.isdigit():
            j = int(cmd)
            if 0 <= j < len(labels):
                idx = j
                _print_labels(labels, idx)
            else:
                print("Range-ээс гадуур.")
            continue
        if cmd == "c":
            ref = stream.latest_quat()
            print(f"✓ Тэгшлэв. ref={np.round(ref, 3)}")
            continue
        if cmd == "d":
            d = os.path.join(C.RAW_DIR, C.safe_name(labels[idx]))
            files = sorted(
                [f for f in os.listdir(d) if f.endswith(".npz")]
            ) if os.path.isdir(d) else []
            if files:
                os.remove(os.path.join(d, files[-1]))
                print(f"× Устгав: {files[-1]}")
            else:
                print("Устгах clip алга.")
            continue

        if cmd in ("", "r"):
            if not stream.connected:
                print("⚠ ESP32 холбогдоогүй байна. Хүлээгээд дахин оролд.")
                continue
            label = labels[idx]
            print(f"● Бичиж байна… {C.CLIP_SECONDS}s — {label}-ийг угаа!")
            rows = stream.record_clip(C.CLIP_SECONDS)
            if rows.shape[0] < C.MIN_WINDOW_FRAMES:
                print(f"⚠ Хэт цөөн frame ({rows.shape[0]}) — хадгалсангүй.")
                continue
            out_dir = os.path.join(C.RAW_DIR, C.safe_name(label))
            os.makedirs(out_dir, exist_ok=True)
            ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            path = os.path.join(out_dir, f"{C.safe_name(label)}_{ts}.npz")
            np.savez_compressed(path, samples=rows, ref=ref)
            last_saved = path
            c = _counts().get(label, 0)
            print(f"✓ Хадгалав ({rows.shape[0]} frame) → нийт {c} clip [{label}]")
            continue

        print("Танигдсангүй. <Enter>=бичих, c, n, p, тоо, d, s, q")
        _ = last_saved


if __name__ == "__main__":
    main()
