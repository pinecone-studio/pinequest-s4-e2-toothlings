'use client'

import BrandLoader from '@/components/ui/BrandLoader'

// Branded route-change loader — the ToothLings mark over three bouncing dots.
// Rendered over the content area while navigating between screens.
const RouteLoader = () => (
  <div className="backdrop-in absolute inset-0 z-30 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
    <BrandLoader />
  </div>
)

export default RouteLoader
