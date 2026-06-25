'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRightIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useSession } from '@/components/providers'
import { homeForRole } from '@/lib/auth'
import { ROUTES } from '@/lib/routes'

const STEPS = [
  { n: '01', title: 'Асуумж + Scan', desc: 'Богино асуумж бөглөж, шүдний зураг аваад AI screening хийнэ.' },
  { n: '02', title: 'Үр дүн + Triage', desc: 'YOLOv8 bounding box, яаралтай эсэх зэрэглэл, зөвлөмж.' },
  { n: '03', title: 'Эмч + Brush', desc: 'Эмчтэй холбогдож, smart сойзоор зөв угаалга хянана.' },
]

const DOCTOR_TIPS = [
  { name: 'Dr. Batbold', tip: 'Өдөрт 2 удаа, 2 минут угаалга — хамгийн үр дүнтэй профилактик.' },
  { name: 'Dr. Oyunaa', tip: '6 сар тутам эмчид үзүүлэх нь кариесыг эрт илрүүлнэ.' },
  { name: 'Dr. Tseren', tip: 'Smart сойзны өнцөг, даралтыг хүүхэдтэй хамт хянана уу.' },
]

const LandingPage = () => {
  const router = useRouter()
  const { token, role } = useSession()

  return (
    <div className="landing-page min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href={ROUTES.landing} className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#F3B900] text-lg font-bold text-slate-900">S</span>
          <span className="text-xl font-bold tracking-tight text-slate-900">Screener</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href={ROUTES.login} className="warm-btn-secondary">
            Нэвтрэх
          </Link>
          <Link href="/register" className="rounded-full bg-[#F3B900] px-5 py-2.5 text-[14px] font-bold text-slate-900 transition-all duration-200 hover:opacity-90">
            Бүртгүүлэх
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center lg:px-10">
        <div>
          <span className="warm-pill text-[12px] font-semibold">AI + Smart Brush</span>
          <h1 className="mt-6 text-[44px] font-bold leading-[1.08] tracking-tight text-slate-900 lg:text-[52px]">
            Хүүхдийн шүдний эрүүл мэндийг гэртээ хяна
          </h1>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-slate-500">
            AI оношлогоо, ухаалаг сойзны нэгдэл — screening систем (эмчийн онош биш). Эмчтэй холбогдож,
            зөв угаалгын зуршил бүрдүүл.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => router.push(token ? homeForRole(role) : ROUTES.login)}
              className="inline-flex items-center gap-2 rounded-full bg-[#F3B900] px-7 py-3.5 text-[15px] font-bold text-slate-900 transition-all duration-200 hover:opacity-90"
            >
              Эхлэх
              <ArrowRightIcon className="size-4" />
            </button>
            <Link href="#how" className="warm-btn-secondary inline-flex items-center px-7 py-3.5 text-[15px] font-semibold">
              Хэрхэн ажилладаг
            </Link>
          </div>
        </div>

        <div className="warm-card relative overflow-hidden p-8 lg:p-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="warm-inset flex flex-col justify-between p-5">
              <CameraIcon className="size-8 text-primary" />
              <div>
                <p className="text-[13px] font-bold">AI Scan</p>
                <p className="text-[11px] text-text-muted">YOLOv8 triage</p>
              </div>
            </div>
            <div className="warm-inset flex flex-col justify-between p-5">
              <SparklesIcon className="size-8 text-primary" />
              <div>
                <p className="text-[13px] font-bold">Smart Brush</p>
                <p className="text-[11px] text-text-muted">Realtime monitor</p>
              </div>
            </div>
            <div className="col-span-2 warm-inset p-6">
              <div className="flex items-center gap-4">
                <ShieldCheckIcon className="size-10 text-triage-green" />
                <div>
                  <p className="text-[15px] font-bold">Итгэлцэл</p>
                  <p className="text-[13px] text-text-muted">Мэргэжилтэн эмчийн зөвлөгөө, нууцлалтай өгөгдөл</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <h2 className="text-[32px] font-bold tracking-tight">Хэрхэн ажилладаг</h2>
        <p className="mt-2 max-w-xl text-text-muted">3 алхам — scan-аас эмчийн зөвлөгөө хүртэл</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="warm-card p-8">
              <span className="text-[36px] font-bold text-primary/40">{s.n}</span>
              <h3 className="mt-4 text-[18px] font-bold">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Doctor advice */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-[32px] font-bold tracking-tight">Эмч нарын зөвлөгөө</h2>
            <p className="mt-2 text-text-muted">Мэргэжилтнүүдийн профилактик зөвлөмж</p>
          </div>
          <UserGroupIcon className="size-10 text-text-muted opacity-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {DOCTOR_TIPS.map((d) => (
            <div key={d.name} className="warm-card p-6">
              <ChatBubbleLeftRightIcon className="size-6 text-primary" />
              <p className="mt-4 text-[14px] font-semibold">{d.name}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-text-muted">&ldquo;{d.tip}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <div className="warm-card flex flex-col items-center justify-between gap-6 bg-slate-900 p-10 text-white md:flex-row">
          <div>
            <h2 className="text-[28px] font-bold">Өнөөдөр эхлээрэй</h2>
            <p className="mt-2 text-white/75">Нэвтэрч scan, brush, эмчийн зөвлөгөөг ашиглана уу.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/register" className="rounded-full bg-[#F3B900] px-6 py-3 font-bold text-slate-900 transition-all duration-200 hover:opacity-90">
              Бүртгүүлэх
            </Link>
            <Link href="/login" className="rounded-full border border-white/30 px-6 py-3 font-semibold transition-all duration-200 hover:bg-white/10">
              Нэвтрэх
            </Link>
          </div>
        </div>
        <p className="mt-8 text-center text-[11px] text-text-muted">
          Screening-and-triage систем — яаралтай тохиолдолд шууд эмчид хандана уу.
        </p>
      </section>
    </div>
  )
}

export default LandingPage
