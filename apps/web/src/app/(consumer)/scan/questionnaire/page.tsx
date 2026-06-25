'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { QuestionProgress, RadioCard } from '@/components/consumer/MobilePatterns'
import Button from '@/components/ui/Button'
import { saveQuestionnaire } from '@/lib/consumerState'
import { ROUTES } from '@/lib/routes'

const VISIT_OPTIONS = [
  { value: 'lt6m', label: '6 сараас бага' },
  { value: '6-12m', label: '6–12 сар' },
  { value: 'gt12m', label: '1 жилээс дээш' },
  { value: 'never', label: 'Хэзээ ч үзүүлээгүй' },
] as const

const SENSITIVITY_OPTIONS = [
  { value: 'none', label: 'Хэвийн' },
  { value: 'cold', label: 'Хүйтэн дээр' },
  { value: 'hot', label: 'Халуун дээр' },
  { value: 'both', label: 'Хоёуланд' },
] as const

const TOTAL_STEPS = 4

const ScanQuestionnairePage = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [childName, setChildName] = useState('')
  const [age, setAge] = useState('')
  const [lastDentalVisit, setLastDentalVisit] = useState('')
  const [hasPain, setHasPain] = useState<'yes' | 'no'>('no')
  const [sensitivity, setSensitivity] = useState<'none' | 'cold' | 'hot' | 'both'>('none')
  const [comorbidities, setComorbidities] = useState('')

  const finish = () => {
    saveQuestionnaire({ childName, age, lastDentalVisit, hasPain, sensitivity, comorbidities })
    router.push(ROUTES.scan.camera)
  }

  const next = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
    else finish()
  }

  const canNext =
    step === 1
      ? childName.trim() && age.trim()
      : step === 2
        ? Boolean(lastDentalVisit)
        : true

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.scan.root}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-[#E8E4DA] transition hover:bg-[#FAF8F5]"
          aria-label="Буцах"
        >
          ←
        </Link>
        <h1 className="text-[20px] font-bold text-slate-900">Асуумж</h1>
      </div>

      <QuestionProgress step={step} total={TOTAL_STEPS} />

      {step === 1 ? (
        <div className="space-y-4">
          <div className="warm-card p-5">
            <p className="text-[18px] font-semibold leading-snug text-slate-900">Хүүхдийн мэдээлэл</p>
          </div>
          <label className="block space-y-2">
            <span className="text-[13px] font-medium text-slate-600">Хүүхдийн нэр</span>
            <input required value={childName} onChange={(e) => setChildName(e.target.value)} className="consumer-input" />
          </label>
          <label className="block space-y-2">
            <span className="text-[13px] font-medium text-slate-600">Нас</span>
            <input
              required
              type="number"
              min={3}
              max={18}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="consumer-input"
            />
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div className="warm-card p-5">
            <p className="text-[18px] font-semibold leading-snug text-slate-900">Сүүлд эмчид үзүүлсэн хугацаа?</p>
          </div>
          <div className="space-y-2">
            {VISIT_OPTIONS.map(({ value, label }) => (
              <RadioCard
                key={value}
                name="visit"
                value={value}
                label={label}
                checked={lastDentalVisit === value}
                onChange={() => setLastDentalVisit(value)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="warm-card p-5">
            <p className="text-[18px] font-semibold leading-snug text-slate-900">Өвдөлт мэдрэгдэж байна уu?</p>
          </div>
          <RadioCard name="pain" value="no" label="Үгүй" checked={hasPain === 'no'} onChange={() => setHasPain('no')} />
          <RadioCard name="pain" value="yes" label="Тийм" checked={hasPain === 'yes'} onChange={() => setHasPain('yes')} />
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <div className="warm-card p-5">
            <p className="text-[18px] font-semibold leading-snug text-slate-900">Шүдний мэдрэг чанар</p>
          </div>
          <div className="space-y-2">
            {SENSITIVITY_OPTIONS.map(({ value, label }) => (
              <RadioCard
                key={value}
                name="sensitivity"
                value={value}
                label={label}
                checked={sensitivity === value}
                onChange={() => setSensitivity(value)}
              />
            ))}
          </div>
          <label className="block space-y-2 pt-2">
            <span className="text-[13px] font-medium text-slate-600">Хавсарсан өвчин (хэрэв байвал)</span>
            <textarea
              value={comorbidities}
              onChange={(e) => setComorbidities(e.target.value)}
              className="consumer-input min-h-[88px] resize-none"
              placeholder="Жишээ: чихрийн шижин…"
            />
          </label>
        </div>
      ) : null}

      <div className="flex gap-3 pt-2">
        {step > 1 ? (
          <Button type="button" variant="secondary" className="flex-1 rounded-full" onClick={() => setStep((s) => s - 1)}>
            Буцах
          </Button>
        ) : null}
        <Button
          type="button"
          className="flex-1 rounded-full bg-[#F3B900] text-slate-900 hover:bg-[#E5AD00]"
          disabled={!canNext}
          onClick={next}
        >
          {step === TOTAL_STEPS ? 'Хадгалж камер руу үргэлжлүүлэх' : 'Дараах'}
        </Button>
      </div>
    </div>
  )
}

export default ScanQuestionnairePage
