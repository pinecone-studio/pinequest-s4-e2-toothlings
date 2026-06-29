FROM python:3.11-slim

RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY --chown=user . .

RUN python download_model.py

# Export ONNX so /model.onnx can serve the on-device model to the mobile app.
RUN python -c "from ultralytics import YOLO; YOLO('best.pt').export(format='onnx', imgsz=640)"

EXPOSE 7860

ENV INFERENCE_PORT=7860
ENV INFERENCE_CONF=0.25

CMD ["python", "server.py"]
