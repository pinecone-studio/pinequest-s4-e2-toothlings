#!/usr/bin/env python3
"""FastAPI inference service for dental caries YOLOv8 model."""

from __future__ import annotations

import io
import os
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image

PORT = int(os.environ.get("INFERENCE_PORT", "8765"))
CONFIDENCE = float(os.environ.get("INFERENCE_CONF", "0.25"))
# Inference resolution. The model is trained on close-up crops; on a wide
# full-mouth photo each lesion shrinks below the detail YOLO needs once the
# image is letterboxed to imgsz, so confidence collapses (e.g. a lesion that
# scores 0.82 close-up scores ~0.31 in a 2386px frame at imgsz=640). Running at
# 1280 keeps lesions ~2x larger so genuine caries clear the triage thresholds.
IMGSZ = int(os.environ.get("INFERENCE_IMGSZ", "1280"))
MODEL_PATH = Path(__file__).resolve().parent / "best.pt"
ONNX_PATH = Path(__file__).resolve().parent / "best.onnx"

# Disease classes used for triage (exclude generic "Tooth" detections)
DISEASE_CLASS_IDS = {0, 1, 2}

app = FastAPI(title="Dental Screener Inference", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None


def get_model():
    global model
    if model is None:
        try:
            from ultralytics import YOLO
            from download_model import download
        except ImportError as exc:
            raise HTTPException(503, f"Inference unavailable: {exc}. Install ultralytics.") from exc
        weights = download()
        model = YOLO(str(weights))
    return model


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": str(MODEL_PATH.name)}


@app.get("/model.onnx")
def serve_onnx():
    if not ONNX_PATH.exists():
        raise HTTPException(404, "ONNX model not found — run: python3 -c \"from ultralytics import YOLO; YOLO('best.pt').export(format='onnx', imgsz=640)\"")
    return FileResponse(str(ONNX_PATH), media_type="application/octet-stream", filename="best.onnx")


@app.post("/")
@app.post("/analyze")
async def analyze(image: UploadFile = File(...)) -> dict:
    raw = await image.read()
    pil_image = Image.open(io.BytesIO(raw)).convert("RGB")
    width, height = pil_image.size

    yolo = get_model()
    results = yolo.predict(
        source=pil_image,
        conf=CONFIDENCE,
        imgsz=IMGSZ,
        verbose=False,
    )

    names = yolo.names
    detections: list[dict] = []
    if results and results[0].boxes is not None:
        boxes = results[0].boxes
        for box in boxes:
            cls_id = int(box.cls.item())
            if cls_id not in DISEASE_CLASS_IDS:
                continue

            raw_name = str(names.get(cls_id, f"class_{cls_id}"))
            class_name = raw_name.lower().replace(" ", "_")
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            detections.append(
                {
                    "class_id": cls_id,
                    "class_name": class_name,
                    "confidence": float(box.conf.item()),
                    "box": {
                        "x1": float(x1),
                        "y1": float(y1),
                        "x2": float(x2),
                        "y2": float(y2),
                    },
                }
            )

    detections.sort(key=lambda d: d["confidence"], reverse=True)

    return {
        "detections": detections,
        "image_width": width,
        "image_height": height,
        "model_info": {
            "name": "yolov8_caries_detector (intraoral)",
            "imgsz": IMGSZ,
            "classes": [
                str(names.get(i, f"class_{i}")).lower()
                for i in sorted(DISEASE_CLASS_IDS)
            ],
            "source": "https://github.com/AndreyGermanov/yolov8_caries_detector",
        },
    }


if __name__ == "__main__":
    import uvicorn

    print(f"Starting inference server on port {PORT}")
    uvicorn.run("server:app", host="0.0.0.0", port=PORT, reload=False)
