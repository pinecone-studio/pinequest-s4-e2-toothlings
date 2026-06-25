'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRightIcon, Squares2X2Icon, ClipboardDocumentCheckIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { useSession } from '@/components/providers'
import { homeForRole } from '@/lib/auth'

const BOARDS = [
  { href: '/dashboard/admin', label: 'Админ самбар', desc: 'Бүх сургууль, дүн, хяналт', Icon: Squares2X2Icon },
  { href: '/dashboard/dentist', label: 'Эмчийн хяналт', desc: 'Скрининг шалгах дараалал', Icon: ClipboardDocumentCheckIcon },
  { href: '/dashboard/follow-up', label: 'Дагалт', desc: 'Дагах шаардлагатай жагсаалт', Icon: ClipboardDocumentListIcon },
]

const LandingPage = () => {
  const router = useRouter()
  const { token, role } = useSession()

  // Begin → into the dashboard: logged in lands on their board (admin → /dashboard/admin),
  // otherwise route through login first.
  const onBegin = () => router.push(token ? homeForRole(role) : '/login')

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg px-6 py-16">
      {/* soft brand glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary-subtle blur-3xl" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        {/* Brand */}
        <div className="mb-6 flex items-center gap-2.5">
          <div
            className="flex size-11 items-center justify-center rounded-2xl text-[20px] font-bold shadow-(--shadow-card)"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-fg)' }}
          >
            S
          </div>
          <span className="text-[22px] font-semibold tracking-tight text-text-base">Screener</span>
        </div>

        {/* Headline */}
        <h1 className="text-balance text-4xl font-bold tracking-tight text-text-base sm:text-5xl">
          Гар утсаар хийх шүдний урьдчилсан скрининг
        </h1>
        <p className="mt-4 max-w-xl text-balance text-[15px] leading-relaxed text-text-muted">
          Багш, сувилагч, эцэг эх хүүхдийн шүдийг гар утасны камераар шалгаж, эмчид хурдан
          чиглүүлнэ. 
        </p>

        {/* Begin CTA */}
        <button
          onClick={onBegin}
          className="btn mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-[15px] font-semibold text-text-on-primary shadow-(--shadow-card-lg) transition-all duration-150 hover:bg-primary-hover active:scale-[0.98]"
        >
          Эхлэх
          <ArrowRightIcon className="size-4" />
        </button>
        {!token && (
          <p className="mt-3 text-[12px] text-text-muted">
            Бүртгэлгүй юу?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">Бүртгүүлэх</Link>
          </p>
        )}

        {/* Board switch */}
        <div className="mt-12 w-full">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Самбар сонгох
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {BOARDS.map(({ href, label, desc, Icon }) => (
              <Link
                key={href}
                href={href}
                className="btn group flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 text-left shadow-(--shadow-card) transition-all duration-150 hover:border-primary hover:shadow-(--shadow-card-lg)"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="text-[14px] font-semibold text-text-base">{label}</span>
                <span className="text-[11px] leading-tight text-text-muted">{desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <p className="relative z-10 mt-12 max-w-md text-center text-[11px] leading-relaxed text-text-muted">
        Screening-and-triage
      </p>
    </main>
  )
}

export default LandingPage
