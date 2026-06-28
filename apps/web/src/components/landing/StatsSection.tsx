'use client'

const STATS = [
  { num: '70%', label: 'хүүхдийн шүд цоорсон', note: '6 настай Монгол хүүхдүүдийн дунд (НЭМҮТ)' },
  { num: '1/10,000', label: 'сумын шүдний эмч', note: 'Алслагдсан суманд хүртээмж туйлын бага' },
  { num: '300+ км', label: 'ойрын эмч хүртэлх зам', note: 'Олон айл нийслэл хүртэл явдаг' },
  { num: '0', label: 'найдвартай triage хэрэгсэл', note: 'Эмч бус хүн ашиглах боломжтой багаж байхгүй' },
]

export const StatsSection = () => (
  <section id="stats" className="relative bg-black" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-36">
      <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.35em]" style={{ color: 'var(--olive)' }}>
        Асуудал
      </p>
      <h2 className="mb-16 font-black uppercase"
        style={{ fontSize: 'clamp(2rem, 5vw, 6rem)', lineHeight: 0.92, letterSpacing: '-0.03em', color: '#fff', maxWidth: '18ch' }}>
        Монгол хүүхдийн шүдний эрүүл мэнд
      </h2>
      <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
        {STATS.map((s, i) => (
          <div key={i} className="flex flex-col gap-3 bg-black px-8 py-10">
            <span
              className="block font-black leading-none"
              style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)', letterSpacing: '-0.04em', color: 'var(--olive)' }}
            >
              {s.num}
            </span>
            <span className="block font-bold text-white" style={{ fontSize: 'clamp(15px,1.3vw,18px)' }}>
              {s.label}
            </span>
            <span className="block text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {s.note}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-16 max-w-2xl">
        <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Screener нь шүдний эмч бус хүмүүст хүүхдийн шүдийг камераар шалгаж,
          яаралтай тусламж хэрэгтэй хүүхдийг эмчид хурдан чиглүүлэх боломж олгоно.
          Скрининг — онош биш.
        </p>
      </div>
    </div>
  </section>
)
