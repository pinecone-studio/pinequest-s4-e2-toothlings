import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen gap-3 bg-bg p-3">
    {/* Sidebar — floating card, same treatment as content cards */}
    <aside className="flex shrink-0 flex-col rounded-2xl border border-border bg-surface shadow-(--shadow-card)">
      <Sidebar />
    </aside>

    {/* Right column */}
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      {/* TopBar — floating card */}
      <header className="shrink-0 rounded-2xl border border-border bg-surface shadow-(--shadow-card)">
        <TopBar />
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-2">{children}</main>
    </div>
  </div>
)

export default AppShell
