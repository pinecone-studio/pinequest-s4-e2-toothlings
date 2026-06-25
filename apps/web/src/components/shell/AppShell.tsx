import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import ThemeToggle from '@/components/ui/ThemeToggle'

// Single warm-cream canvas: floating icon rail on the left, content on the
// right, floating theme toggle bottom-right (no top nav bar — mockup style).
const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen gap-4 bg-bg p-4">
    <aside className="sticky top-4 flex h-[calc(100vh-2rem)] shrink-0 flex-col rounded-3xl border border-border bg-surface shadow-(--shadow-card)">
      <Sidebar />
    </aside>

    <main className="min-w-0 flex-1 overflow-y-auto pb-4">{children}</main>

    <ThemeToggle />
  </div>
)

export default AppShell
