import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Screener — Админ самбар',
  description: 'Шүдний цоорол илрүүлэх скрининг — ростер ба хяналтын самбар',
}

const initThemeScript = `(function(){try{if(localStorage.getItem('screener.theme')==='dark')document.documentElement.classList.add('dark')}catch(_){}})()`

const RootLayout = ({ children }: LayoutProps<'/'>) => (
  <html lang="mn" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: initThemeScript }} />
    </head>
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
)

export default RootLayout
