'use client'
import Image from 'next/image'

const QRCard = ({ size }: { size: number }) => (
  <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
    <div className="relative flex flex-col items-center justify-center gap-4 px-5 py-3" style={{ background: '#0d0d0d' }}>
      <Image src="/images/qr.png" alt="QR код" width={size} height={size} className="rounded-lg" />
    </div>
    <div className="px-6 py-5" style={{ background: '#111' }}>
      <p className="mb-1 font-black text-white" style={{ fontSize: 'clamp(15px,1.6vw,20px)' }}>ToothLings — Гар утасны апп</p>
      <div className="my-4 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>QR уншуулж мобайл хувилбарыг үзнэ үү</span>
    </div>
  </div>
)

export const MobileSection = () => (
  <section id="mobile" className="relative overflow-hidden bg-black" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
    <div className="flex flex-col px-6 pb-16 pt-28 md:hidden">
      <h2 className="mb-6 select-none font-black uppercase"
        style={{ fontSize: 'clamp(1.6rem, 7vw, 2.4rem)', lineHeight: 0.92, letterSpacing: '-0.03em' }}>
        <span className="block" style={{ color: 'var(--olive)' }}>Гар утасны</span>
        <span className="block text-white">апп</span>
      </h2>
      <p className="mb-10 text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>
        ToothLings-г iOS ба Android утсан дээр татаж сүлжээгүй нөхцөлд ашиглах боломжтой.
       
      </p>
      <QRCard size={280} />
    </div>
    <div className="mx-auto hidden w-full max-w-6xl md:flex md:min-h-screen md:items-center md:gap-[4vw] md:px-6 md:py-24">
      <div style={{ flex: '1 1 52%', minWidth: 280 }}>
        <h2 className="mb-10 select-none font-black uppercase"
          style={{ fontSize: 'clamp(1.8rem, 4.5vw, 5rem)', lineHeight: 0.92, letterSpacing: '-0.03em' }}>
          <span className="block" style={{ color: 'var(--olive)' }}>Гар утасны</span>
          <span className="block text-white">апп</span>
        </h2>
        <p className="max-w-[38ch] text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>
          ToothLings-г iOS ба Android утсан дээр татаж, сүлжээгүй нөхцөлд ашиглах боломжтой.
        
        </p>
      </div>
      <div style={{ flex: '0 1 380px', minWidth: 280 }}>
        <QRCard size={320} />
      </div>
    </div>
  </section>
)
