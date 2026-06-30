import { AlertTriangle } from '@/lib/icons'
import { FlatCard } from '@/components/consumer/warm/WarmUI'
import { TriageHeroCard } from '@/components/consumer/MobilePatterns'
import type { ScanResult } from '@/lib/consumerState'
import { topDetectionPerLabel } from './detectionMeta'
import { DetectionGroup } from './DetectionGroup'
import { GuidanceSections } from './GuidanceSections'
import { ScheduleCallCard } from './ScheduleCallCard'

const TRIAGE_LABEL: Record<'green' | 'yellow' | 'red', string> = {
  red: 'Яаралтай эмчилгээ шаардлагатай',
  yellow: 'Эмчилгээ шаардлагатай',
  green: 'Дараагийн хяналтанд орох',
}

/** Шинжилгээний үр дүнгийн самбар — дүгнэлт, зөвлөмж, илрүүлэлт, дараагийн алхам. */
export const ResultsPanel = ({ result }: { result: ScanResult }) => {
  const triageLevel = result.triage === 'red' ? 'red' : result.triage === 'yellow' ? 'yellow' : 'green'

  // Зөвхөн хамгийн өндөр итгэлцэлтэй илрүүлэлтийг (төрөл тус бүрээр) харуулна.
  const problems = topDetectionPerLabel(result.detections.filter((d) => d.label !== 'Healthy'))
  const healthy = topDetectionPerLabel(result.detections.filter((d) => d.label === 'Healthy'))

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-text-base">Дүгнэлт</h2>
        <p className="mt-1 text-[13px] text-text-muted">Gemini AI Vision</p>
      </div>

      <TriageHeroCard level={triageLevel} label={TRIAGE_LABEL[triageLevel]} summary={result.advice} />

      {/* Нас тохирсон дэлгэрэнгүй зөвлөмж — Gemini-аас ирвэл бүх зэрэглэлд харуулна.
          Ирээгүй тохиолдолд ногоон үед advice-г тусад нь харуулна (давхцал үүсгэхгүй). */}
      {result.guidance ? (
        <GuidanceSections guidance={result.guidance} />
      ) : triageLevel === 'green' ? (
        <FlatCard className="p-6">
          <p className="text-[12px] font-bold uppercase tracking-wide text-text-muted">Зөвлөмж</p>
          <p className="mt-4 text-[15px] leading-relaxed text-text-base">{result.advice}</p>
        </FlatCard>
      ) : null}

      <DetectionGroup title="Таньсан өөрчлөлтүүд" detections={problems} idPrefix="problem" />
      <DetectionGroup title="Харьцангуй эрүүл шүднүүд" detections={healthy} idPrefix="healthy" />

      {result.detections.length === 0 && (
        <p className="text-[14px] text-text-muted">Таньсан өөрчлөлт алга.</p>
      )}

      {triageLevel === 'red' && <ScheduleCallCard />}

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-text-muted">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
        Зурагт үндэслэсэн дүгнэлт гаргаж амны хөндийн байдлыг үнэлэн чиглүүлэх зорилготой ба шүд цоорох өвчин ба түүний хүндрэлийн эцсийн онош биш юм.
      </p>
    </div>
  )
}
