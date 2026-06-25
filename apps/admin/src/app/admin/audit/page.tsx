'use client'

import { useQuery } from '@tanstack/react-query'
import { apiStatFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

type AuditEntry = {
  id: string
  entityType: string
  entityId: string
  action: string
  oldValue: string | null
  newValue: string | null
  createdAt: string
  user: { id: string; name: string; role: string }
}

const ACTION_CLS: Record<string, string> = {
  review: 'text-primary',
  override_update: 'text-triage-yellow',
  notify: 'text-triage-green',
  update: 'text-text-muted',
  create: 'text-triage-green',
}

const AuditPage = () => {
  const { token } = useSession()
  const { data, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: () => apiStatFetch<AuditEntry[]>('/api/audit', { token, revalidate: 30 }),
    enabled: !!token,
  })

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight text-text-base">Аудит бүртгэл</h1>

      {isLoading ? (
        <p className="text-sm text-text-muted">Ачааллаж байна…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-(--shadow-card)">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium text-text-muted">Огноо</th>
                <th className="px-4 py-3 font-medium text-text-muted">Хэрэглэгч</th>
                <th className="px-4 py-3 font-medium text-text-muted">Объект</th>
                <th className="px-4 py-3 font-medium text-text-muted">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-text-muted">
                    {new Date(e.createdAt).toLocaleString('mn-MN')}
                  </td>
                  <td className="px-4 py-2.5 text-text-base">
                    {e.user.name}
                    <span className="ml-1 text-xs text-text-muted">({e.user.role})</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-text-muted">
                    {e.entityType} <span className="text-text-base">{e.entityId.slice(0, 8)}…</span>
                  </td>
                  <td className={`px-4 py-2.5 font-medium ${ACTION_CLS[e.action] ?? 'text-text-base'}`}>
                    {e.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AuditPage
