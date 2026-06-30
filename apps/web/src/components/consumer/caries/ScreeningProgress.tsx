/** Шинжилсэн / үлдсэн хүүхдийн прогрессыг бар + тоогоор харуулна (улирал эсвэл анги). */
export const ScreeningProgress = ({
  label,
  screened,
  total,
}: {
  label: string
  screened: number
  total: number
}) => {
  const pct = total ? Math.min(100, Math.round((screened / total) * 100)) : 0
  const remaining = Math.max(total - screened, 0)
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 truncate text-[12px] font-semibold text-text-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="shrink-0 whitespace-nowrap text-[12px] tabular-nums text-text-base">
        Хамрагдсан {screened}/{total} · Үлдсэн {remaining}
      </span>
    </div>
  )
}
