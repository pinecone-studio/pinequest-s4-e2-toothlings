"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalyzeResponse } from "@/lib/types";
import { ResultPanel } from "./ResultPanel";
import { ImageCanvas } from "./ImageCanvas";

type CaptureMode = "upload" | "camera";

export function ScreenerApp() {
  const [mode, setMode] = useState<CaptureMode>("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      setError(null);
    } catch {
      setError("Камер нээхэд алдаа гарлаа. Зөвшөөрөл өгсөн эсэхээ шалгана уу.");
      setCameraReady(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (mode === "camera") {
      void startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  const resetPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  const handleFileChange = (file: File | null) => {
    resetPreview();
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) return;

    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(blob));
    setResult(null);
    setError(null);
  };

  const analyze = async () => {
    if (!selectedFile) {
      setError("Эхлээд зураг сонгоно уу.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? data.detail ?? "Шинжилгээ амжилтгүй");
      }

      setResult(data as AnalyzeResponse);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Dental AI Screener
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Шүдний зураг аваад AI screening хийх
        </h1>
        <p className="max-w-3xl text-base leading-7 text-slate-600">
          Зураг оруулах эсвэл камераар аваад YOLO загвар ашиглан caries, cavity, crack
          илрүүлж triage зөвлөмж харуулна. Энэ нь screening систем — эмчийн онош биш.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
          <div className="mb-5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("upload");
                resetPreview();
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "upload"
                  ? "bg-teal-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Файл оруулах
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("camera");
                resetPreview();
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "camera"
                  ? "bg-teal-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Камер
            </button>
          </div>

          {mode === "upload" ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-teal-500 hover:bg-teal-50/40"
              >
                <span className="text-lg font-medium text-slate-800">Зураг сонгох</span>
                <span className="mt-2 text-sm text-slate-500">JPG, PNG — шүдний ойрын зураг</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl bg-black">
                <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted />
              </div>
              <button
                type="button"
                disabled={!cameraReady}
                onClick={() => void captureFromCamera()}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Зураг авах
              </button>
            </div>
          )}

          {previewUrl && (
            <div className="mt-5 space-y-4">
              <ImageCanvas previewUrl={previewUrl} result={result} />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void analyze()}
                  disabled={loading}
                  className="rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Шинжилж байна..." : "AI шинжилгээ хийх"}
                </button>
                <button
                  type="button"
                  onClick={resetPreview}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Цэвэрлэх
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </section>

        <ResultPanel result={result} loading={loading} />
      </div>
    </div>
  );
}
