import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Screener — Админ самбар',
  description: 'Шүдний цоорол илрүүлэх скрининг — ростер ба хяналтын самбар',
}

const RootLayout = ({ children }: LayoutProps<'/'>) => (
  <html lang="mn">
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
)

export default RootLayout
