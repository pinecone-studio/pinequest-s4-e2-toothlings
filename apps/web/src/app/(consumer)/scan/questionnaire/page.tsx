'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { AppShell } from '@/components/consumer/AppShell'
import Button from '@/components/ui/Button'
import { saveQuestionnaire } from '@/lib/consumerState'
import { ROUTES } from '@/lib/routes'

const ScanQuestionnairePage = () => {
  const router = useRouter()
  const [childName, setChildName] = useState('')
  const [age, setAge] = useState('')
  const [lastDentalVisit, setLastDentalVisit] = useState('')
  const [hasPain, setHasPain] = useState<'yes' | 'no'>('no')
  const [sensitivity, setSensitivity] = useState<'none' | 'cold' | 'hot' | 'both'>('none')
  const [comorbidities, setComorbidities] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    saveQuestionnaire({ childName, age, lastDentalVisit, hasPain, sensitivity, comorbidities })
    router.push(ROUTES.scan.camera)
  }

  return (
    <AppShell title="Асуумж" subtitle="Contextual data — AI нарийвчлал" backHref={ROUTES.scan.root}>
      <form onSubmit={onSubmit} className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-[13px] font-medium">Хүүхдийн нэр</span>
          <input required value={childName} onChange={(e) => setChildName(e.target.value)} className="consumer-input" />
        </label>
        <label className="block space-y-2">
          <span className="text-[13px] font-medium">Нас</span>
          <input required type="number" min={3} max={18} value={age} onChange={(e) => setAge(e.target.value)} className="consumer-input" />
        </label>
        <label className="block space-y-2 md:col-span-2">
          <span className="text-[13px] font-medium">Сүүлд эмчид үзүүлсэн</span>
          <select required value={lastDentalVisit} onChange={(e) => setLastDentalVisit(e.target.value)} className="consumer-input">
            <option value="">Сонгох</option>
            <option value="lt6m">6 сараас бага</option>
            <option value="6-12m">6–12 сар</option>
            <option value="gt12m">1 жилээс дээш</option>
            <option value="never">Хэзээ ч үзүүлээгүй</option>
          </select>
        </label>

        <fieldset className="warm-card space-y-3 p-5 md:col-span-2">
          <legend className="text-[13px] font-medium">Өвдөлт мэдрэгдэж байна уу?</legend>
          <div className="flex gap-4">
            {(['no', 'yes'] as const).map((v) => (
              <label key={v} className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-3">
                <input type="radio" name="pain" checked={hasPain === v} onChange={() => setHasPain(v)} />
                {v === 'yes' ? 'Тийм' : 'Үгүй'}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block space-y-2 md:col-span-2">
          <span className="text-[13px] font-medium">Шүдний мэдрэг чанар</span>
          <select value={sensitivity} onChange={(e) => setSensitivity(e.target.value as typeof sensitivity)} className="consumer-input">
            <option value="none">Хэвийн</option>
            <option value="cold">Хүйтэн дээр</option>
            <option value="hot">Халуун дээр</option>
            <option value="both">Хоёуланд</option>
          </select>
        </label>

        <label className="block space-y-2 md:col-span-2">
          <span className="text-[13px] font-medium">Хавсарсан өвчин (хэрэв байвал)</span>
          <textarea value={comorbidities} onChange={(e) => setComorbidities(e.target.value)} className="consumer-input min-h-[88px] resize-none" placeholder="Жишээ: чихрийн шижин…" />
        </label>

        <div className="md:col-span-2">
          <Button type="submit" size="lg">Хадгалж камер руу үргэлжлүүлэх</Button>
        </div>
      </form>
    </AppShell>
  )
}

export default ScanQuestionnairePage
