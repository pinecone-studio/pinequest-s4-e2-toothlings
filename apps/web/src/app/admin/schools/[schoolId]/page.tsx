'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { useCarryForward, useClasses, useCreateClass } from '@/hooks/useClasses'

const SchoolClassesPage = () => {
  const schoolId = useParams().schoolId as string
  const { data: classes, isLoading } = useClasses(schoolId)
  const createClass = useCreateClass(schoolId)
  const carryForward = useCarryForward(schoolId)
  const [name, setName] = useState('')
  const [seasonId, setSeasonId] = useState('2026-spring')

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return
    createClass.mutate({ name: name.trim(), seasonId })
    setName('')
  }

  const onCarry = (classId: string) => {
    const newSeasonId = window.prompt('Шинэ улирлын нэр (ж: 2027-spring)')
    if (newSeasonId) carryForward.mutate({ classId, newSeasonId })
  }

  return (
    <section className="flex flex-col gap-5">
      <Link href="/admin" className="text-sm text-neutral-500 underline">
        ← Сургуулиуд
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Ангиуд</h1>
      <form onSubmit={onAdd} className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ангийн нэр (ж: 3А)"
          className="rounded-lg border border-neutral-300 px-3 py-2"
        />
        <input
          value={seasonId}
          onChange={(e) => setSeasonId(e.target.value)}
          placeholder="Улирал"
          className="rounded-lg border border-neutral-300 px-3 py-2"
        />
        <button className="rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white">Нэмэх</button>
      </form>
      {isLoading ? (
        <p className="text-neutral-500">Ачааллаж байна…</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {classes?.map((c) => (
            <li key={c.id} className="flex items-center gap-3">
              <Link href={`/admin/classes/${c.id}`} className="underline">
                {c.name} · {c.seasonId}
              </Link>
              <button
                onClick={() => onCarry(c.id)}
                className="text-xs text-neutral-500 underline"
              >
                Дараа улирал руу
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default SchoolClassesPage
