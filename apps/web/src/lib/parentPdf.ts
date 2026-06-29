import type { ChildScreeningSummary } from '@pinequest/types'
import type { HospitalGuide } from '@/hooks/useChildSummary'

const LEVEL_MN: Record<string, string> = {
  green: 'Дараагийн хяналтанд хамруулах',
  yellow: 'Эмчилгээ шаардлагатай',
  red: 'Яаралтай эмчилгээ шаардлагатай',
}
const STAGE_MN: Record<string, string> = {
  primary: 'сүүн шүдний нас',
  mixed: 'холимог шүдний нас',
  permanent: 'байнгын шүдний нас',
}
const LEVEL_COLOR: Record<string, { bg: string; fg: string; border: string }> = {
  red: { bg: '#FBF1F0', fg: '#A84545', border: '#A8454530' },
  yellow: { bg: '#FEF3E7', fg: '#A8580A', border: '#A8580A30' },
  green: { bg: '#EEF9F3', fg: '#3B8C5E', border: '#3B8C5E30' },
}

export const printChildSummary = (
  childName: string,
  s: ChildScreeningSummary,
  imageRefs: string[],
  hospital?: HospitalGuide | null,
): void => {
  const col = LEVEL_COLOR[s.effectiveLevel] ?? { bg: '#F5F5F4', fg: '#78716C', border: '#78716C30' }
  const levelLabel = LEVEL_MN[s.effectiveLevel] ?? s.effectiveLevel
  const date = new Date(s.capturedAt).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const realImages = imageRefs.filter((r) => r.startsWith('http'))

  const imgsHtml = realImages.length
    ? realImages
        .map(
          (src) =>
            `<img src="${src}" alt="Зураг" style="max-width:100%;border-radius:8px;margin:6px 0;" />`,
        )
        .join('')
    : `<div style="background:#F5F5F4;border-radius:8px;padding:24px;text-align:center;color:#9CA3AF;font-size:13px;">Синк хийгдсэн зураг байхгүй</div>`

  const stepsHtml = s.homeSteps
    .map((step) => `<li style="margin:6px 0;font-size:13px;color:#374151;">${step}</li>`)
    .join('')

  const hospitalHtml = hospital
    ? `<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:14px;margin-top:8px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#0284C7;margin-bottom:6px;">Хамгийн ойр эмнэлэг</div>
        <div style="font-weight:700;font-size:14px;color:#111827;">${hospital.name}</div>
        <div style="font-size:12px;color:#6B7280;margin-top:6px;">${hospital.address}</div>
        <div style="font-size:12px;color:#6B7280;">${hospital.travelMinutes} минутын зайд · ${hospital.distanceKm} км</div>
        <div style="font-size:12px;color:#6B7280;">${hospital.schedule}</div>
        <div style="font-size:13px;font-weight:700;color:#0284C7;margin-top:6px;">${hospital.phone}</div>
      </div>`
    : ''

  const html = `<!DOCTYPE html><html lang="mn"><head>
  <meta charset="UTF-8"><title>Шүдний үзүүлэлт — ${childName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; padding: 32px 24px; max-width: 620px; margin: 0 auto; color: #111827; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head><body>
  <div style="text-align:center;margin-bottom:24px;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9CA3AF;margin-bottom:4px;">Toothlings — Шүдний скрининг</div>
    <div style="font-size:20px;font-weight:800;color:#111827;">${childName}</div>
    <div style="font-size:12px;color:#6B7280;margin-top:2px;">${date}</div>
    <div style="display:inline-block;margin-top:10px;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:700;background:${col.bg};color:${col.fg};border:1px solid ${col.border};">${levelLabel}</div>
  </div>
  <div style="margin-bottom:16px;">${imgsHtml}</div>
  <div style="background:${col.bg};border:1px solid ${col.border};border-radius:10px;padding:14px;margin-bottom:16px;">
    <div style="font-size:14px;font-weight:700;color:${col.fg};line-height:1.4;">${s.headline}</div>
    <div style="font-size:12px;color:#6B7280;margin-top:6px;">${s.ageYears} нас · ${STAGE_MN[s.dentitionStage] ?? ''} · ${s.flaggedAreas} хэсэг тэмдэглэгдсэн</div>
  </div>
  ${s.homeSteps.length ? `<div style="margin-bottom:16px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6B7280;margin-bottom:8px;">Гэрийн арчилгаа</div><ul style="padding-left:18px;">${stepsHtml}</ul></div>` : ''}
  ${hospitalHtml}
  <div style="margin-top:24px;padding-top:14px;border-top:1px solid #E5E7EB;font-size:11px;color:#9CA3AF;line-height:1.6;">
    АНХААР: Энэ бол урьдчилсан дүгнэлт бөгөөд <strong>ОНОШ БИШ</strong>.<br>
    Эцсийн дүгнэлтийг мэргэжлийн шүдний эмч баталгаажуулна.
  </div>
  <div class="no-print" style="margin-top:24px;text-align:center;">
    <button onclick="window.print()" style="background:#F2B705;border:none;border-radius:10px;padding:10px 28px;font-size:14px;font-weight:700;cursor:pointer;color:#1A1407;">PDF хадгалах / Хэвлэх</button>
  </div>
</body></html>`

  const win = window.open('', '_blank', 'width=700,height=900')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
}
