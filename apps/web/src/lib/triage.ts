import type { AnalyzeResponse, Detection, DetectionClass, TriageLevel } from "./types";
import { CLASS_LABELS_MN, TRIAGE_LABELS_MN } from "./types";

const CLASS_TO_TRIAGE: Record<string, TriageLevel> = {
  caries: "red",
  cavity: "red",
  crack: "yellow",
};

const ADVICE: Record<TriageLevel, string> = {
  red: "Шүдний эмчид ойрын хугацаанд үзүүлэхийг зөвлөж байна. Өдөрт 2 удаа зөв үүсгэж, чихэрлэг зүйлийг хязгаарлаарай.",
  yellow: "Бөөнөхий эсвэл эрт шатны өөрчлөлт байж болзошгүй. 1–3 сарын дотор шүдний эмчид хяналтаар үзүүлээрэй.",
  green:
    "AI screening-ээр тодорхой эмгэг илрээгүй. Энэ нь онош биш — жилд дор хаяж 1 удаа эмчид шалгуулахыг зөвлөж байна.",
};

export function buildAnalyzeResponse(payload: {
  detections: Array<{
    class_id: number;
    class_name: string;
    confidence: number;
    box: { x1: number; y1: number; x2: number; y2: number };
  }>;
  image_width: number;
  image_height: number;
  model_info: { name: string; classes: string[] };
}): AnalyzeResponse {
  const detections: Detection[] = payload.detections.map((d) => {
    const className = d.class_name as Detection["className"];
    const labelMn = getLabelMn(className, d.class_name);
    return {
      classId: d.class_id,
      className,
      labelMn,
      confidence: d.confidence,
      box: d.box,
    };
  });

  const triage = computeTriage(detections);

  return {
    detections,
    triage,
    triageLabelMn: TRIAGE_LABELS_MN[triage],
    adviceMn: ADVICE[triage],
    disclaimerMn:
      "Энэ үр дүн нь AI screening бөгөөд эмчийн онош биш. Эцсийн шийдвэрийг шүдний эмч гаргана.",
    imageWidth: payload.image_width,
    imageHeight: payload.image_height,
    modelInfo: payload.model_info,
  };
}

function getLabelMn(className: Detection["className"], fallback: string): string {
  if (className in CLASS_LABELS_MN) {
    return CLASS_LABELS_MN[className as DetectionClass];
  }
  return fallback;
}

function computeTriage(detections: Detection[]): TriageLevel {
  if (detections.length === 0) return "green";

  let level: TriageLevel = "green";
  for (const d of detections) {
    const next = CLASS_TO_TRIAGE[d.className] ?? "yellow";
    if (next === "red") return "red";
    if (next === "yellow") level = "yellow";
  }
  return level;
}
