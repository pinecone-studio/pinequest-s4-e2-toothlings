import { ConsumerGuard } from '@/components/consumer/ConsumerGuard'
import { ConsumerShell } from '@/components/consumer/ConsumerShell'

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsumerGuard>
      <ConsumerShell>{children}</ConsumerShell>
    </ConsumerGuard>
  )
}
