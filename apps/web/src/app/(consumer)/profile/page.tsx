'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppShell, StatusPill } from '@/components/consumer/AppShell'
import { ThemeToggle } from '@/components/consumer/ThemeToggle'
import { MonthlyHealthChart } from '@/components/consumer/MiniChart'
import {
  AnchorPill,
  FeatureRow,
  PillButton,
  SectionHeader,
  SettingRow,
} from '@/components/consumer/warm/WarmUI'
import { FileDown, History } from '@/lib/icons'
import { useMe, useSwitchRole } from '@/hooks/useMe'
import {
  clearQuestionnaire,
  getBrushSession,
  getQuestionnaire,
  getScanHistory,
  type BrushSession,
  type QuestionnaireAnswers,
  type ScanResult,
} from '@/lib/consumerState'
import { ROUTES } from '@/lib/routes'

const PROFILE_SECTIONS = [
  { id: 'export', label: 'Тайлан' },
  { id: 'history', label: 'Түүх' },
  { id: 'settings', label: 'Тохиргоо' },
] as const

const ExportSection = () => {
  const downloadJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      questionnaire: getQuestionnaire(),
      scanHistory: getScanHistory(),
      lastBrushSession: getBrushSession(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `screener-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPdf = () => {
    alert('PDF тайлан — production-д server-side PDF generator холбогдоно. Одоо JSON татна уу.')
    downloadJson()
  }

  return (
    <section id="export" className="scroll-mt-24">
      <SectionHeader
        eyebrow="01 · Тайлан"
        title="Тайлан гаргах"
        subtitle="Шалгалт болон угаалгын түүхийг PDF эсвэл JSON хэлбэрээр татаж хадгална."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="warm-card p-8 lg:p-10">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#F3B900]/15 text-[#B8860B]">
            <FileDown className="size-6" strokeWidth={2} />
          </div>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-text-muted">
            PDF тайланд ангилал, зөвлөмж, угаалгын статистик, асуумжийн хариулт багтана. JSON нь
            систем хоорондын интеграцид тохиромжтой.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PillButton className="flex-1 px-8" onClick={downloadPdf}>
              PDF тайлан татах
            </PillButton>
            <PillButton variant="secondary" className="flex-1 px-8" onClick={downloadJson}>
              JSON татах
            </PillButton>
          </div>
        </div>

        <div className="warm-card divide-y divide-[#E8E4DA]/60 p-2">
          <ul className="px-4">
            <FeatureRow icon={<span className="text-[12px] font-bold">20</span>} label="Сүүлийн шалгалтын түүх" />
            <FeatureRow icon={<span className="text-[12px] font-bold">Q</span>} label="Асуумжийн хариулт" />
            <FeatureRow icon={<span className="text-[12px] font-bold">B</span>} label="Угаалгын бүртгэл" />
          </ul>
        </div>
      </div>
    </section>
  )
}

const triageTone = (triage: string): 'green' | 'yellow' | 'red' => {
  if (triage === 'red') return 'red'
  if (triage === 'yellow') return 'yellow'
  return 'green'
}

const triageLabel = (triage: string, urgent?: boolean) => {
  if (urgent) return 'Яаралтай'
  if (triage === 'yellow') return 'Анхаарал'
  if (triage === 'red') return 'Яаралтай'
  return 'Хэвийн'
}

const HistorySection = () => {
  const [scans, setScans] = useState<ScanResult[]>([])
  const [q, setQ] = useState<QuestionnaireAnswers | null>(null)
  const [brush, setBrush] = useState<BrushSession | null>(null)

  useEffect(() => {
    setScans(getScanHistory())
    setQ(getQuestionnaire())
    setBrush(getBrushSession())
  }, [])

  const monthly = [62, 58, 71, 65, 78, 82]

  return (
    <section id="history" className="scroll-mt-24">
      <SectionHeader
        eyebrow="02 · Түүх"
        title="Түүх"
        subtitle="Шалгалт, угаалга болон сар бүрийн эрүүл мэндийн динамик."
      />

      <div className="mt-8 space-y-6">
        <MonthlyHealthChart values={monthly} />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="warm-card overflow-hidden">
            <div className="border-b border-[#E8E4DA]/60 px-6 py-4">
              <div className="flex items-center gap-2">
                <History className="size-4 text-text-muted" strokeWidth={2} />
                <h4 className="text-[15px] font-semibold text-text-base">Шалгалтын түүх</h4>
              </div>
            </div>
            <div className="p-4">
              {scans.length ? (
                <ul className="space-y-2">
                  {scans.slice(0, 5).map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between rounded-2xl bg-surface-raised px-4 py-3"
                    >
                      <span className="text-[13px] text-text-muted">
                        {new Date(s.createdAt).toLocaleDateString('mn-MN')}
                      </span>
                      <StatusPill label={triageLabel(s.triage, s.urgent)} tone={triageTone(s.triage)} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-2 py-6 text-center text-[14px] text-text-muted">Шалгалт хийгээгүй байна</p>
              )}
            </div>
          </div>

          <div className="warm-card overflow-hidden">
            <div className="border-b border-[#E8E4DA]/60 px-6 py-4">
              <h4 className="text-[15px] font-semibold text-text-base">Асуумж + Угаалга</h4>
            </div>
            <div className="p-6">
              {q ? (
                <p className="text-[14px] font-medium text-text-base">
                  {q.childName}
                  <span className="font-normal text-text-muted"> · {q.age} нас</span>
                </p>
              ) : (
                <p className="text-[14px] text-text-muted">Асуумж бөглөөгүй</p>
              )}
              {brush ? (
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-surface-raised p-4 text-[11px] leading-relaxed text-text-muted">
                  {JSON.stringify(brush.zones, null, 2)}
                </pre>
              ) : (
                <p className="mt-4 text-[13px] text-text-muted">Угаалгын бүртгэл байхгүй</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const SettingsSection = () => {
  const router = useRouter()
  const { data: me } = useMe()
  const switchRole = useSwitchRole()
  const isParentView = me?.activeRole === 'parent'

  const toParent = () => switchRole.mutate('parent', { onSuccess: () => router.push('/dashboard/admin/child') })
  const toStaff = () => switchRole.mutate('teacher', { onSuccess: () => router.push('/dashboard/admin') })

  return (
  <section id="settings" className="scroll-mt-24">
    <SectionHeader eyebrow="03 · Тохиргоо" title="Тохиргоо" subtitle="Мэдэгдэл, хэл, нууц үг болон апп тохиргоо." />

    {me?.hasParentLink && (
      <button
        type="button"
        onClick={isParentView ? toStaff : toParent}
        disabled={switchRole.isPending}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-6 py-3 text-[14px] font-bold text-primary transition-all duration-200 hover:bg-primary/20 disabled:opacity-50"
      >
        {isParentView ? '← Багш горимд буцах' : 'Эцэг эх болж хүүхдээ харах →'}
      </button>
    )}

    <div className="warm-card mt-8 divide-y divide-border-muted px-6">
      <SettingRow
        title="Гэрэл / харанхуй горим"
        description="Аппын өнгөний схем"
        control={<ThemeToggle />}
      />
      <SettingRow
        title="Эмчийн цаг сануулах"
        description="Мэдэгдэл илгээнэ"
        control={<input type="checkbox" defaultChecked className="size-4 accent-[#F3B900]" />}
      />
      <SettingRow
        title="Угаалгын сануулагч"
        description="Өглөө, орой"
        control={<input type="checkbox" defaultChecked className="size-4 accent-[#F3B900]" />}
      />
      <div className="py-4">
        <label className="block space-y-2">
          <span className="text-[14px] font-medium text-text-base">Хэл</span>
          <select className="consumer-input max-w-xs">
            <option>Монгол</option>
          </select>
        </label>
      </div>
    </div>

    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <PillButton
        variant="secondary"
        className="flex-1"
        onClick={() => alert('Нууц үг солих — Firebase Auth production-д')}
      >
        Нууц үг солих
      </PillButton>
      <PillButton
        variant="ghost"
        className="flex-1 ring-1 ring-border"
        onClick={() => {
          clearQuestionnaire()
          router.push(ROUTES.scan.questionnaire)
        }}
      >
        Шалгалтын асуумж дахин бөглөх
      </PillButton>
    </div>
  </section>
  )
}

const ProfilePage = () => (
  <AppShell eyebrow="Бүртгэл" title="Профайл" subtitle="Тайлан татах, түүх харах, апп тохиргоо — нэг scroll дээр.">
    <nav className="mb-12 flex flex-wrap gap-2">
      {PROFILE_SECTIONS.map(({ id, label }) => (
        <AnchorPill key={id} href={`#${id}`} label={label} />
      ))}
    </nav>

    <div className="space-y-20">
      <ExportSection />
      <div className="warm-divider" />
      <HistorySection />
      <div className="warm-divider" />
      <SettingsSection />
    </div>
  </AppShell>
)

export default ProfilePage
