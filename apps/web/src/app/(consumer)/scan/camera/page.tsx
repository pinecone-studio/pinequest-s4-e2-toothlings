'use client'

import { CariesDetectorDashboard } from '@/components/consumer/CariesDetectorDashboard'

const ScanCameraPage = () => (
  <div className="mx-auto max-w-[1400px]">
    <div className="mb-10">
      <p className="text-[13px] font-semibold uppercase tracking-wider text-[#F3B900]">AI Screening</p>
      <h2 className="mt-2 text-[32px] font-bold tracking-tight text-slate-900">Intraoral Caries Detector</h2>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500">
        YOLOv8 оношлогоо — зураг оруулаад шууд triage, зөвлөмж хараарай.
      </p>
    </div>
    <CariesDetectorDashboard />
  </div>
)

export default ScanCameraPage
