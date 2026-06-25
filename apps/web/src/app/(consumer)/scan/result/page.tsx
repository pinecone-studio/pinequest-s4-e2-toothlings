'use client'

import Link from 'next/link'
import { ArrowLeft } from '@/lib/icons'
import { CariesDetectorDashboard } from '@/components/consumer/CariesDetectorDashboard'

const ScanResultPage = () => (
  <div className="mx-auto max-w-[1400px]">
    <div className="mb-10 flex items-start gap-4">
      <Link
        href="/scan/camera"
        className="mt-1 flex size-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-200 hover:opacity-90"
        aria-label="Буцах"
      >
        <ArrowLeft className="size-4" strokeWidth={2} />
      </Link>
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-wider text-[#F3B900]">Scan үр дүн</p>
        <h2 className="mt-1 text-[32px] font-bold tracking-tight text-slate-900">AI Analysis</h2>
      </div>
    </div>
    <CariesDetectorDashboard initialResult />
  </div>
)

export default ScanResultPage
