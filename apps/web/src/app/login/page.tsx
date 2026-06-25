'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { apiFetch } from '@/lib/api'
import { homeForRole, setToken } from '@/lib/auth'
import { useSession } from '@/components/providers'

type AuthData = { token: string; user: { id: string; name: string; role: string } }

const inputCls =
  'rounded-lg border border-border bg-surface px-3 py-2 text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary'

const LoginPage = () => {
  const router = useRouter()
  const { refresh } = useSession()
  const [email, setEmail] = useState('admin@screener.mn')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const data = await apiFetch<AuthData>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      setToken(data.token)
      refresh()
      router.push(homeForRole(data.user.role))
    } catch (err) {
      setError(
        err instanceof Error && err.message === 'invalid_credentials'
          ? 'Имэйл эсвэл нууц үг буруу байна'
          : 'Серверт холбогдсонгүй — API (:4000) ажиллаж байгаа эсэхийг шалгана уу',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-8">
      <div>
        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xl font-bold text-text-on-primary">
          S
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-base">Screener</h1>
        <p className="mt-1 text-sm text-text-muted">Скрининг удирдлагын самбар</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Имэйл"
          className={inputCls}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Нууц үг"
          className={inputCls}
        />
        {error ? <p className="text-sm text-triage-red">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-primary px-3 py-2 font-medium text-text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {busy ? 'Түр хүлээнэ үү…' : 'Нэвтрэх'}
        </button>
      </form>
      <p className="text-sm text-text-muted">
        Шинэ скрининг хийгч үү?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Бүртгүүлэх
        </Link>
      </p>
    </main>
  )
}

export default LoginPage
