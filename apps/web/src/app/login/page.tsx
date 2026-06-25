'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { AuthShell, GoogleAuthButton } from '@/components/consumer/AuthShell'
import Button from '@/components/ui/Button'
import { apiFetch, authErrorText } from '@/lib/api'
import { homeForRole, setToken } from '@/lib/auth'
import { useSession } from '@/components/providers'

type AuthData = { token: string; user: { id: string; name: string; role: string } }

const LoginPage = () => {
  const router = useRouter()
  const { refresh } = useSession()
  const [email, setEmail] = useState('')
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
      router.replace(homeForRole(data.user.role))
    } catch (err) {
      setError(authErrorText(err instanceof Error ? err.message : ''))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Нэвтрэх"
      subtitle="Имэйл, нууц үгээр эсвэл Google-ээр нэвтэрнэ үү"
      footer={
        <p className="text-center text-[14px] text-text-muted">
          Бүртгэлгүй юу?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Бүртгүүлэх
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-[13px] font-medium">Имэйл</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="consumer-input" placeholder="name@email.com" />
        </label>
        <label className="block space-y-2">
          <span className="text-[13px] font-medium">Нууц үг</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="consumer-input" placeholder="••••••••" />
        </label>
        <div className="flex justify-end">
          <button type="button" onClick={() => alert('Нууц үг сэргээх — Firebase Auth production-д')} className="text-[12px] font-medium text-primary hover:underline">
            Нууц үг мартсан?
          </button>
        </div>
        {error ? <p className="text-[13px] text-triage-red">{error}</p> : null}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? 'Түр хүлээнэ үү…' : 'Нэвтрэх'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <p className="relative mx-auto w-fit bg-surface px-3 text-[11px] text-text-muted">эсвэл</p>
      </div>

      <GoogleAuthButton />
    </AuthShell>
  )
}

export default LoginPage
