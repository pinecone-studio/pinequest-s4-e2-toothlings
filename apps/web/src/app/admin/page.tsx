'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { useCreateSchool, useSchools } from '@/hooks/useSchools'

const AdminDashboardPage = () => {
  const { data: schools, isLoading } = useSchools()
  const createSchool = useCreateSchool()
  const [name, setName] = useState('')

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return
    createSchool.mutate({ name: name.trim() })
    setName('')
  }

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">Сургуулиуд</h1>
      <form onSubmit={onAdd} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Шинэ сургуулийн нэр"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2"
        />
        <button className="rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white">Нэмэх</button>
      </form>
      {isLoading ? (
        <p className="text-neutral-500">Ачааллаж байна…</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {schools?.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/schools/${s.id}`} className="text-neutral-900 underline">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default AdminDashboardPage
