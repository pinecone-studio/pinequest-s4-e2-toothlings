export type DetectionClass = "caries" | "cavity" | "crack";

export type TriageLevel = "red" | "yellow" | "green";

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  classId: number;
  className: DetectionClass;
  labelMn: string;
  confidence: number;
  box: BoundingBox;
}

export interface AnalyzeResponse {
  detections: Detection[];
  triage: TriageLevel;
  triageLabelMn: string;
  adviceMn: string;
  disclaimerMn: string;
  imageWidth: number;
  imageHeight: number;
  modelInfo: {
    name: string;
    classes: string[];
  };
}

export const CLASS_LABELS_MN: Record<DetectionClass, string> = {
  caries: "Шүдний өвчин (caries)",
  cavity: "Цоорхой (cavity)",
  crack: "Бөөнөхий / анзаарагдах гэмтэл",
};

export const TRIAGE_LABELS_MN: Record<TriageLevel, string> = {
  red: "Яаралтай — эмчид үзүүлэх",
  yellow: "Анхаарал хэрэгтэй — хяналтаар үзүүлэх",
  green: "Одоогоор тодорхой эмгэг илрээгүй",
};
