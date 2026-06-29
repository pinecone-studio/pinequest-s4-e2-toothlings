import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import { WelcomeDisclaimer } from '@/components/auth/WelcomeDisclaimer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Toothlings',
  description: 'Шүдний цоорол илрүүлэх скрининг — ростер ба хяналтын самбар',
}

const initThemeScript = `(function(){try{if(localStorage.getItem('toothlings.theme')==='dark')document.documentElement.classList.add('dark')}catch(_){}})()`

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="mn" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: initThemeScript }} />
    </head>
    <body>
      <Providers>
        {children}
        <WelcomeDisclaimer />
      </Providers>
    </body>
  </html>
)

export default RootLayout
