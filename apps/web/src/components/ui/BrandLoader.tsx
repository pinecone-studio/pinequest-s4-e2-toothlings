'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

// The app's branded loading beat — the ToothLings mark over three bouncing dots.
// Reused by the route-change overlay and inline section loaders alike.
const BrandLoader = ({ className }: { className?: string }) => (
  <div
    role="status"
    aria-live="polite"
    aria-label="Ачааллаж байна"
    className={cn('flex flex-col items-center justify-center gap-5', className)}
  >
    <div className="flex flex-col items-center gap-2.5">
      <div className="float">
        {/* dark mode → yellow logo; light mode → black logo (matches Sidebar) */}
        <Image src="/logoYellow.png" alt="" width={52} height={52} priority className="hidden object-contain dark:block" />
        <Image src="/logoBlack.png" alt="" width={52} height={52} priority className="block object-contain dark:hidden" />
      </div>
      <p className="text-[12.5px] font-bold tracking-wide">
        <span className="text-text-base">Tooth</span><span className="text-primary">Lings</span>
      </p>
    </div>
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className="loader-dot size-2 rounded-full bg-primary" style={{ animationDelay: `${i * 0.16}s` }} />
      ))}
    </div>
  </div>
)

export default BrandLoader
