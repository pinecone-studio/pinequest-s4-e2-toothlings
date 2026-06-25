'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { PlusIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline'
import { useSchools, useCreateSchool } from '@/hooks/useSchools'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'

// Schools/cohorts — relocated here from the admin board (Phase 0 decision).
const CohortsPage = () => {
  const { data: schools } = useSchools()
  const createSchool = useCreateSchool()
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return
    createSchool.mutate({ name: name.trim() })
    setName('')
    setShowAdd(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-text-base">Сургууль ба бүлгүүд</h1>
          <p className="text-[12px] text-text-muted">Скринингийн хамрах сургуулиуд</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowAdd((v) => !v)}>
          <PlusIcon className="size-3.5" /> Сургууль нэмэх
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={onAdd} className="flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Сургуулийн нэр"
            className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit">Нэмэх</Button>
          <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Болих</Button>
        </form>
      )}

      {!schools || schools.length === 0 ? (
        <Card><EmptyState Icon={BuildingLibraryIcon} title="Сургууль алга" hint="Эхний сургуулиа нэмж скрининг хамралтыг эхлүүл." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {schools.map((s) => (
            <Link key={s.id} href={`/dashboard/admin/schools/${s.id}`}>
              <Card interactive className="flex items-center gap-3 hover:border-primary">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-[12px] font-bold text-primary">
                  {s.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="flex-1 truncate text-[13px] font-medium text-text-base">{s.name}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default CohortsPage
