import { NextRequest, NextResponse } from "next/server";
import { buildAnalyzeResponse } from "@/lib/triage";

const INFERENCE_URL = process.env.INFERENCE_URL ?? "http://127.0.0.1:8765/analyze";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Зураг оруулна уу." }, { status: 400 });
    }

    const upstream = new FormData();
    upstream.append("image", file, "capture.jpg");

    const response = await fetch(INFERENCE_URL, {
      method: "POST",
      body: upstream,
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        {
          error: "Inference сервер алдаа өгсөн.",
          detail,
          hint: "npm run dev ажиллуулсан эсэхээ шалгаарай (inference + web хоёулаа).",
        },
        { status: 502 },
      );
    }

    const payload = await response.json();
    return NextResponse.json(buildAnalyzeResponse(payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Шинжилгээ хийхэд алдаа гарлаа.",
        detail: message,
        hint: "Эхлээд npm run setup, дараа нь npm run dev ажиллуулна уу.",
      },
      { status: 500 },
    );
  }
}
