'use client'

// 10 child icons; the first 8 carry the accent to show ~8/10 (89.7%) with caries.
const ChildIcon = ({ affected }: { affected: boolean }) => (
  <svg viewBox="0 0 24 32" width="100%" height="100%" aria-hidden
    style={{ display: 'block', color: affected ? 'var(--olive)' : '#fff' }}>
    <circle cx="12" cy="6" r="5" fill="currentColor" />
    <path d="M3 31v-9a9 9 0 0 1 18 0v9z" fill="currentColor" />
  </svg>
)

export const KidsRatio = () => (
  <div className="w-full max-w-sm">
    <div className="grid grid-cols-5 gap-3" role="img"
      aria-label="10 хүүхэд тутмын 8 нь шүдний цооролтой">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} style={{ aspectRatio: '24 / 32' }}>
          <ChildIcon affected={i < 8} />
        </div>
      ))}
    </div>
    <p className="mt-6 text-[13px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--olive)' }}>
      10 хүүхэд тутмын 8
    </p>
  </div>
)
