'use client'

import { MagnifyingGlassIcon, AcademicCapIcon } from '@heroicons/react/24/solid'
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown'

type Props = {
  q: string; onQ: (v: string) => void
  grade: string; onGrade: (v: string) => void
  section: string; onSection: (v: string) => void
  trendFilter: boolean; onTrend: (v: boolean) => void
  isLoading: boolean
}

// Анги = 1-12, бүлэг = Монгол цагаан толгой А-Н, дараа нь "Бусад". Ангийн нэр эдгээрийн
// нийлбэр (ж: "3А"), тул чөлөөт бичвэрийн оронд сонголтоор жигдэлж давхардлыг арилгана.
const GRADES = Array.from({ length: 12 }, (_, i) => String(i + 1))
export const SECTION_LETTERS = 'АБВГДЕЁЖЗИЙКЛМН'.split('')
/** А-Н-д багтахгүй бусад бүх бүлэг (хоосон нэр ч мөн). */
export const SECTION_OTHER = 'other'

const gradeOptions: DropdownOption[] = [
  { value: '', label: 'Бүх анги', Icon: AcademicCapIcon },
  ...GRADES.map((g) => ({ value: g, label: `${g}-р анги`, Icon: AcademicCapIcon })),
]
const sectionOptions: DropdownOption[] = [
  { value: '', label: 'Бүх бүлэг' },
  ...SECTION_LETTERS.map((s) => ({ value: s, label: `${s} бүлэг` })),
  { value: SECTION_OTHER, label: 'Бусад' },
]

const chip = (active: boolean, danger = false) =>
  `btn rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all ${
    active
      ? danger ? 'bg-triage-red text-white' : 'bg-primary text-text-on-primary'
      : danger
        ? 'border border-border bg-surface text-text-muted hover:border-triage-red hover:text-triage-red'
        : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-primary'
  }`

const SummaryFilterBar = ({ q, onQ, grade, onGrade, section, onSection, trendFilter, onTrend, isLoading }: Props) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="relative">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      <input
        value={q}
        onChange={(e) => onQ(e.target.value)}
        placeholder="Нэрээр хайх…"
        aria-label="Сурагч хайх"
        className="w-52 rounded-full border border-border bg-surface py-1.5 pl-9 pr-3 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <button onClick={() => onTrend(!trendFilter)} className={chip(trendFilter, true)}>
      Хүндрэх эрсдэлтэй
    </button>

    {!isLoading && (
      <>
        <div className="h-5 w-px bg-border" />
        <Dropdown value={grade} options={gradeOptions} onChange={onGrade} ariaLabel="Анги сонгох" size="sm" />
        <Dropdown value={section} options={sectionOptions} onChange={onSection} ariaLabel="Бүлэг сонгох" size="sm" />
      </>
    )}
  </div>
)

export default SummaryFilterBar
