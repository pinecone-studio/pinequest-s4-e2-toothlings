'use client'

import { AppShell, FlowCard } from '@/components/consumer/AppShell'
import { ROUTES } from '@/lib/routes'

const BrushHubPage = () => (
  <AppShell title="Brush" subtitle="Заавар · 3D · smart monitor">
    <div className="grid gap-6 md:grid-cols-2">
      <FlowCard href={ROUTES.brush.instructions} emoji="📖" title="Шүд угаах заавар" desc="Видео + 3D анимац + 45°" accent="gold" />
      <FlowCard href={ROUTES.brush.monitor} emoji="📡" title="Smart Brush Monitor" desc="Realtime · даралт · timer" accent="dark" />
    </div>
  </AppShell>
)

export default BrushHubPage
