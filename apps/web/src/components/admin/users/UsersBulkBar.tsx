'use client'

import { TrashIcon, CheckCircleIcon, NoSymbolIcon, XMarkIcon } from '@heroicons/react/24/solid'

type Props = {
  count: number
  pending: boolean
  onActivate: () => void
  onDeactivate: () => void
  onDelete: () => void
  onClear: () => void
}

const btn = 'btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-50'

const UsersBulkBar = ({ count, pending, onActivate, onDeactivate, onDelete, onClear }: Props) => (
  <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2.5">
    <span className="text-[13px] font-semibold text-text-base">{count} сонгосон</span>
    <div className="h-5 w-px bg-border" />
    <button onClick={onActivate} disabled={pending} className={`${btn} border border-border bg-surface text-text-base hover:border-triage-green hover:text-triage-green`}>
      <CheckCircleIcon className="size-4" /> Идэвхжүүлэх
    </button>
    <button onClick={onDeactivate} disabled={pending} className={`${btn} border border-border bg-surface text-text-base hover:border-text-muted`}>
      <NoSymbolIcon className="size-4" /> Идэвхгүй болгох
    </button>
    <button onClick={onDelete} disabled={pending} className={`${btn} bg-triage-red text-white hover:bg-triage-red/90`}>
      <TrashIcon className="size-4" /> Устгах
    </button>
    <button onClick={onClear} aria-label="Сонголт цуцлах" className={`${btn} ml-auto border border-border bg-surface text-text-muted hover:border-border`}>
      <XMarkIcon className="size-4" /> Болих
    </button>
  </div>
)

export default UsersBulkBar
