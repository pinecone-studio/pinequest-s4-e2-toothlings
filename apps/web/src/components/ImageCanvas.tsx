"use client";

import { useCallback, useEffect, useRef } from "react";
import type { AnalyzeResponse } from "@/lib/types";

const BOX_COLORS = ["#dc2626", "#d97706", "#7c3aed"];

interface ImageCanvasProps {
  previewUrl: string;
  result: AnalyzeResponse | null;
}

export function ImageCanvas({ previewUrl, result }: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxWidth = 560;
    const scale = Math.min(1, maxWidth / image.width);
    const width = Math.round(image.width * scale);
    const height = Math.round(image.height * scale);

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    if (!result) return;

    const scaleX = width / result.imageWidth;
    const scaleY = height / result.imageHeight;

    result.detections.forEach((detection, index) => {
      const { x1, y1, x2, y2 } = detection.box;
      const color = BOX_COLORS[index % BOX_COLORS.length];

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1 * scaleX, y1 * scaleY, (x2 - x1) * scaleX, (y2 - y1) * scaleY);

      const label = `${detection.labelMn} ${(detection.confidence * 100).toFixed(0)}%`;
      ctx.font = "bold 13px sans-serif";
      const textWidth = ctx.measureText(label).width;
      const boxY = Math.max(18, y1 * scaleY - 8);

      ctx.fillStyle = color;
      ctx.fillRect(x1 * scaleX, boxY - 18, textWidth + 10, 20);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, x1 * scaleX + 5, boxY - 4);
    });
  }, [result]);

  useEffect(() => {
    const image = new Image();
    image.src = previewUrl;
    imageRef.current = image;
    image.onload = () => draw();
  }, [previewUrl, draw]);

  useEffect(() => {
    if (imageRef.current?.complete) draw();
  }, [result, draw]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <canvas ref={canvasRef} className="mx-auto block max-w-full" />
    </div>
  );
}
