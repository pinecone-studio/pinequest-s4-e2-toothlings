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

const errorText = (msg: string): string => {
  if (msg === 'email_taken') return 'Энэ имэйл аль хэдийн бүртгэлтэй байна'
  if (msg === 'invalid_input') return 'Нэр, имэйл болон 6+ тэмдэгт нууц үг шаардлагатай'
  return 'Серверт холбогдсонгүй — API (:4000) ажиллаж байгаа эсэхийг шалгана уу'
}

const RegisterPage = () => {
  const router = useRouter()
  const { refresh } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const data = await apiFetch<AuthData>('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
      })
      setToken(data.token)
      refresh()
      router.push(homeForRole(data.user.role))
    } catch (err) {
      setError(errorText(err instanceof Error ? err.message : ''))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-text-base">
          Скрининг хийгчээр бүртгүүлэх
        </h1>
        <p className="text-sm text-text-muted">
          Багш, сургууль/цэцэрлэгийн эмч зэрэг шүдний бус ажилтнуудад зориулсан.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Нэр"
          className={inputCls}
        />
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
          placeholder="Нууц үг (6+ тэмдэгт)"
          className={inputCls}
        />
        {error ? <p className="text-sm text-triage-red">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-primary px-3 py-2 font-medium text-text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {busy ? 'Түр хүлээнэ үү…' : 'Бүртгүүлэх'}
        </button>
      </form>
      <p className="text-sm text-text-muted">
        Бүртгэлтэй юу?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Нэвтрэх
        </Link>
      </p>
    </main>
  )
}

export default RegisterPage
