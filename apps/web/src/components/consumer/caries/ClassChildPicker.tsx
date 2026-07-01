'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDaysIcon, AcademicCapIcon, UserIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useSession } from '@/components/providers'
import {
  getMyClasses,
  getRosterStatus,
  addStudent,
  type MyClass,
  type RosterChild,
} from '@/lib/screeningApi'
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown'
import { formatSeason } from '@/lib/season'
import { ScreeningProgress } from './ScreeningProgress'
import { ClassTotalEditor } from './ClassTotalEditor'

/** What the dashboard needs to persist a screening to the DB. */
export type ScreenTarget = {
  childKey: string
  classId: string
  schoolId: string
  seasonId: string
  childLabel: string
  /** Хүүхдийн нас (birthYear-аас бодсон). Web дээр асуумж байхгүй тул AI зөвлөмжийн цорын ганц өвчтөний контекст. */
  age: string
}

const selectCls =
  'rounded-full border border-border bg-surface-raised px-4 py-2 text-[13px] text-text-base outline-none transition-colors placeholder:text-text-muted focus:border-[#0e9594] disabled:cursor-not-allowed disabled:opacity-50'

/** Улирал → анги → хүүхэд гэсэн тусдаа шүүлтүүрээр сонгоно. Улирал/ангийн шинжилсэн-үлдсэн прогрессийг харуулна. */
export const ClassChildPicker = ({
  onChange,
  resetSignal = 0,
}: {
  onChange: (t: ScreenTarget | null) => void
  /** Скрининг хадгалмагц нэмэгддэг — сонголтыг цэвэрлэж, хамрагдалтыг DB-ээс дахин уншина. */
  resetSignal?: number
}) => {
  const { token } = useSession()
  const [classes, setClasses] = useState<MyClass[]>([])
  const [seasonId, setSeasonId] = useState('')
  const [classId, setClassId] = useState('')
  const [childKey, setChildKey] = useState('')
  const [roster, setRoster] = useState<RosterChild[]>([])
  const [adding, setAdding] = useState(false)
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [age, setAge] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyClasses(token).then(setClasses).catch(() => setError('Анги уншиж чадсангүй'))
  }, [token])

  // Улирлын жагсаалт (давхцалгүй) ба сонгосон улирлын ангиуд — тусдаа шүүлтүүр.
  const seasons = useMemo(() => [...new Set(classes.map((c) => c.seasonId))], [classes])
  const seasonClasses = useMemo(
    () => classes.filter((c) => c.seasonId === seasonId),
    [classes, seasonId],
  )
  // Улирлын нийт хамрагдалт — тухайн улирлын бүх ангийн нийлбэр. Хуваарь нь ангид
  // тохируулсан "Нийт хүүхэд" (expectedTotal), байхгүй бол бүртгэгдсэн хүүхдийн тоо.
  const seasonTotals = useMemo(
    () =>
      seasonClasses.reduce(
        (a, c) => ({ screened: a.screened + c.screened, total: a.total + (c.expectedTotal || c.enrolled) }),
        { screened: 0, total: 0 },
      ),
    [seasonClasses],
  )

  useEffect(() => {
    onChange(null)
    setAdding(false)
    setChildKey('')
    if (!classId) {
      setRoster([])
      return
    }
    getRosterStatus(token, classId).then(setRoster).catch(() => setRoster([]))
  }, [classId, token])

  // Скрининг хадгалсны дараа: сонгосон хүүхдийг цэвэрлээд анги + ростерын хамрагдалтыг
  // DB-ээс дахин уншина → прогресс баар, ✓ тэмдэг шинэ бүртгэлийг тусгана.
  useEffect(() => {
    if (!resetSignal) return
    setChildKey('')
    onChange(null)
    getMyClasses(token).then(setClasses).catch(() => {})
    if (classId) getRosterStatus(token, classId).then(setRoster).catch(() => {})
  }, [resetSignal])

  const cls = classes.find((c) => c.id === classId)
  const screenedInClass = roster.filter((r) => r.screenedAt).length
  // Persist the teacher-set total locally so both the class + season bars recompute.
  const applyTotal = (n: number) =>
    setClasses((cs) => cs.map((c) => (c.id === classId ? { ...c, expectedTotal: n } : c)))

  // Header-ийн улирлын сонголттой ижил Dropdown UI — placeholder + icon-той сонголтууд.
  const seasonOptions: DropdownOption[] = [
    { value: '', label: 'Улирал сонгох…', Icon: CalendarDaysIcon },
    ...seasons.map((s) => ({ value: s, label: formatSeason(s), Icon: CalendarDaysIcon })),
  ]
  const classOptions: DropdownOption[] = [
    { value: '', label: 'Анги сонгох…', Icon: AcademicCapIcon },
    ...seasonClasses.map((c) => ({ value: c.id, label: `${c.name} (${c.screened}/${c.enrolled})`, Icon: AcademicCapIcon })),
  ]
  const childOptions: DropdownOption[] = [
    { value: '', label: 'Хүүхэд сонгох…', Icon: UserIcon },
    ...roster.map((r) => ({ value: r.childKey, label: `${r.screenedAt ? '✓ ' : ''}${r.lastName} ${r.firstName}`, Icon: UserIcon })),
  ]

  const emit = (kid: { childKey: string; firstName: string; lastName: string; birthYear: number }) => {
    if (!cls) return
    const age = kid.birthYear ? String(new Date().getFullYear() - kid.birthYear) : ''
    onChange({
      childKey: kid.childKey,
      classId: cls.id,
      schoolId: cls.schoolId,
      seasonId: cls.seasonId,
      childLabel: `${kid.lastName} ${kid.firstName}`.trim() || kid.childKey,
      age,
    })
  }

  const handleAdd = async () => {
    if (!cls || !first.trim() || !last.trim() || !age.trim()) return
    setBusy(true)
    setError(null)
    try {
      const birthYear = new Date().getFullYear() - parseInt(age, 10)
      const res = await addStudent(token, classId, { firstName: first.trim(), lastName: last.trim(), birthYear })
      const created = res.children[0]
      if (created) {
        setRoster(await getRosterStatus(token, classId).catch(() => roster))
        emit(created)
        setChildKey(created.childKey)
        setAdding(false)
        setFirst('')
        setLast('')
        setAge('')
      }
    } catch {
      setError('Хүүхэд нэмэхэд алдаа гарлаа')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-raised p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Dropdown
          value={seasonId}
          options={seasonOptions}
          onChange={(v) => {
            setSeasonId(v)
            setClassId('')
          }}
          ariaLabel="Улирал сонгох"
          className="min-w-48"
        />

        <Dropdown
          value={classId}
          options={classOptions}
          onChange={(v) => setClassId(v)}
          ariaLabel="Анги сонгох"
          disabled={!seasonId}
          className="min-w-48"
        />

        <Dropdown
          value={childKey}
          options={childOptions}
          onChange={(v) => {
            setChildKey(v)
            const kid = roster.find((r) => r.childKey === v)
            if (kid) emit(kid)
            else onChange(null)
          }}
          ariaLabel="Хүүхэд сонгох"
          disabled={!classId || adding}
          className="min-w-48"
        />

        <button
          type="button"
          onClick={() => setAdding(true)}
          disabled={!classId || adding}
          className="btn rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text-base transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Шинэ хүүхэд
        </button>
      </div>

      {/* Улирал/ангиар шинжилсэн-үлдсэн хүүхдийн прогресс. */}
      {seasonId && <ScreeningProgress label="Улирал" screened={seasonTotals.screened} total={seasonTotals.total} />}
      {classId && cls && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="min-w-[240px] flex-1">
            <ScreeningProgress label={cls.name} screened={screenedInClass} total={cls.expectedTotal || roster.length} />
          </div>
          <ClassTotalEditor classId={cls.id} value={cls.expectedTotal} onSaved={applyTotal} />
        </div>
      )}

      {classId && adding && (
        <div className="flex flex-wrap items-center gap-2">
          <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Овог" aria-label="Овог" className={`${selectCls} w-32`} />
          <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Нэр" aria-label="Нэр" className={`${selectCls} w-32`} />
          <input value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))} placeholder="Нас" aria-label="Нас" inputMode="numeric" className={`${selectCls} w-20`} />
          <button type="button" disabled={busy || !first.trim() || !last.trim() || !age.trim()} onClick={handleAdd} className="btn rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-on-primary transition hover:bg-primary-hover disabled:opacity-50">
            {busy ? 'Нэмж байна…' : 'Нэмж сонгох'}
          </button>
          <button type="button" onClick={() => setAdding(false)} aria-label="Болих" title="Болих" className="btn inline-flex items-center justify-center rounded-full border border-border bg-surface p-2 text-text-muted transition hover:border-border">
            <TrashIcon className="size-4 shrink-0" />
          </button>
        </div>
      )}

      {error && <p className="text-[12px] text-triage-red">{error}</p>}
    </div>
  )
}
