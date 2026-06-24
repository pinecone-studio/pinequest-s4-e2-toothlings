import type { AnalyzeResponse } from "@/lib/types";

interface ResultPanelProps {
  result: AnalyzeResponse | null;
  loading: boolean;
}

const TRIAGE_STYLES = {
  red: "border-red-300 bg-red-50 text-red-800",
  yellow: "border-amber-300 bg-amber-50 text-amber-900",
  green: "border-emerald-300 bg-emerald-50 text-emerald-900",
} as const;

export function ResultPanel({ result, loading }: ResultPanelProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
      <h2 className="text-xl font-semibold text-slate-900">Үр дүн</h2>
      <p className="mt-2 text-sm text-slate-500">
        Загвар: YOLOv8 intraoral caries detector (research/demo)
      </p>

      {loading && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-600">
          Зураг дээр илрүүлэлт хийж байна...
        </div>
      )}

      {!loading && !result && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
          Зураг оруулаад &quot;AI шинжилгээ хийх&quot; товчийг дарна уу.
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-5">
          <div className={`rounded-2xl border px-4 py-4 ${TRIAGE_STYLES[result.triage]}`}>
            <p className="text-sm font-medium uppercase tracking-wide">Triage</p>
            <p className="mt-1 text-lg font-semibold">{result.triageLabelMn}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold text-slate-800">Зөвлөмж</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{result.adviceMn}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Илрүүлсэн зүйлс ({result.detections.length})
            </p>
            {result.detections.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Тодорхой box илрээгүй.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {result.detections.map((detection, index) => (
                  <li
                    key={`${detection.className}-${index}`}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-800">{detection.labelMn}</span>
                      <span className="font-mono text-slate-500">
                        {(detection.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
            {result.disclaimerMn}
          </p>
        </div>
      )}
    </section>
  );
}
