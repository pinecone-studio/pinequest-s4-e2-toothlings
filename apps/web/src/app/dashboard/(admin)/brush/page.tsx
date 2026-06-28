'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'
import { BrushInstructions } from './BrushInstructions'
import { BrushMonitor } from './BrushMonitor'

type Tab = 'instructions' | 'monitor'

const TABS: { id: Tab; label: string }[] = [
  { id: 'instructions', label: 'Заавар' },
  { id: 'monitor',      label: 'Ухаалаг хяналт' },
]

const BrushPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab: Tab = searchParams.get('tab') === 'monitor' ? 'monitor' : 'instructions'

  useSetPageHeader({
    title: 'Ухаалаг сойз',
    subtitle: tab === 'instructions' ? 'Видео · 3D анимац · 45° өнцөг' : 'Хамралтын хяналт · бодит цаг',
  })

  const setTab = (next: Tab) =>
    router.replace(next === 'instructions' ? '/dashboard/brush' : '/dashboard/brush?tab=monitor', { scroll: false })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        {TABS.map(({ id, label }) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
              tab === id ? 'bg-primary text-text-on-primary' : 'bg-surface-raised text-text-muted hover:text-text-base'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'instructions' ? <BrushInstructions /> : <BrushMonitor />}
    </div>
  )
}

const BrushPage = () => (
  <Suspense fallback={<div className="py-12 text-center text-text-muted">Ачааллаж байна…</div>}>
    <BrushPageContent />
  </Suspense>
)

export default BrushPage
