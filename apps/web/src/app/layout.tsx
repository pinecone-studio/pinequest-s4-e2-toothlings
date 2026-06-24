import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Screener — Админ самбар',
  description: 'Шүдний цоорол илрүүлэх скрининг — ростер ба хяналтын самбар',
}

// `LayoutProps` is a Next.js generated global (.next/types) — using it keeps our
// props identical to what Next validates, avoiding React-types version friction.
const RootLayout = ({ children }: LayoutProps<'/'>) => (
  <html lang="mn">
    <body>{children}</body>
  </html>
)

export default RootLayout
