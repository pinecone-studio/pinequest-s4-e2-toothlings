'use client'
import { LenisProvider } from './LenisProvider'
import { Header } from './Header'
import { HeroWordmark } from './HeroWordmark'
import { Hero } from './hero/Hero'
import { StatsSection } from './StatsSection'
import { FeaturesSection } from './features/FeaturesSection'
import { MobileSection } from './MobileSection'
import { PageNav } from './PageNav'
import { Footer } from './Footer'
import { AuthOverlay } from './AuthOverlay'

export const Landing = () => (
  <>
    <style>{`
      :root {
        --olive: #F2B705;
      }
      .landing-wrap { background: #000; color: #fff; }
    `}</style>
    <LenisProvider>
      <div className="landing-wrap">
        <Header />
        <HeroWordmark />
        <Hero />
        <StatsSection />
        <FeaturesSection />
        <MobileSection />
        <Footer />
        <PageNav />
        <AuthOverlay />
      </div>
    </LenisProvider>
  </>
)
