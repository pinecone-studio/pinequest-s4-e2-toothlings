'use client'
import { MongoliaMap } from './MongoliaMap'
import { KidsRatio } from './KidsRatio'

export const StatsSection = () => (
  <section id="stats" className="relative bg-black" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-36">
      <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.35em]" style={{ color: 'var(--olive)' }}>
        Асуудал
      </p>
      <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">
        <div className="max-w-2xl">
          <h2 className="mb-6 font-black uppercase"
            style={{ fontSize: 'clamp(2rem, 5vw, 6rem)', lineHeight: 0.92, letterSpacing: '-0.03em', color: '#fff', maxWidth: '18ch' }}>
            Шүд цоорох өвчний тархалтын судалгаа
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Монгол улсад нийт хүүхдийн 89.7% нь шүдний цооролтой боловч алслагдсан сум, багт хамгийн ойр шүдний эмнэлэг 300+ км зайд
            байрлаж байна. Энэ нь эмчилгээ тусламж, үзлэг хяналтанд орох хугацааг хойшлуулж, хүүхдийн зовиур,
            өвдөлтийг анхааралгүй орхиход хүргэж байна.
          </p>
          <div className="mt-10">
            <p className="font-black uppercase leading-none"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', letterSpacing: '-0.03em', color: 'var(--olive)' }}>
             89.7%
            </p>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Улсын хэмжээнд 5 настай хүүхдийн 82.9%, 12 настай хүүхдийн 80.9% нь шүд цоорох өвчинд нэрвэгдсэн байна.

            </p>
          </div>
        </div>
        <div className="flex h-full w-full items-center justify-center p-8 sm:p-10 lg:w-104">
          <KidsRatio />
        </div>
      </div>
      <MongoliaMap />
      <div className="mt-16 max-w-2xl">
        <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
         Энэхүү апп нь асуумж ба зурагт үндэслэн хүүхдийн амны хөндийн байдалд дүгнэлт хийх ба шүд цоорох өвчин ба түүний хүндрэлийн эцсийн онош биш юм.
         Хүндрэлээс урьдчилан сэргийлж цаг тухайд тусламж, эмчилгээнд чиглүүлэх зорилготой.
        </p>
      </div>
      <p className="mt-12 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Эх сурвалж: Монгол Улсын Үндэсний амны хөндийн эрүүл мэндийн судалгаа (National Oral
        Health Survey, Mongolia), Central Asian Journal of Medical Sciences.
      </p>
    </div>
  </section>
)
