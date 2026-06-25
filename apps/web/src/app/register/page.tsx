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

const errorText = (msg: string): string => {
  if (msg === 'email_taken') return 'Энэ имэйл аль хэдийн бүртгэлтэй байна'
  if (msg === 'invalid_input') return 'Нэр, имэйл болон 6+ тэмдэгт нууц үг шаардлагатай'
  return 'Серверт холбогдсонгүй — API ажиллаж байгаа эсэхийг шалгана уу'
}

const RegisterPage = () => {
  const router = useRouter()
  const { refresh } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
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
        body: { name, email, password, phone },
      })
      setToken(data.token)
      refresh()
      router.replace(homeForRole(data.user.role))
    } catch (err) {
      setError(errorText(err instanceof Error ? err.message : ''))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Бүртгүүлэх"
      subtitle="Хувийн screening, brush түүхээ хадгалах"
      footer={
        <p className="text-center text-[14px] text-text-muted">
          Бүртгэлтэй юу?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Нэвтрэх
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Нэр" required className="consumer-input" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Имэйл" required className="consumer-input" />
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Утасны дугаар" className="consumer-input" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Нууц үг (6+ тэмдэгт)" required className="consumer-input" />
        {error ? <p className="text-[13px] text-triage-red">{error}</p> : null}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? 'Түр хүлээнэ үү…' : 'Бүртгүүлэх'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <p className="relative mx-auto w-fit bg-surface px-3 text-[11px] text-text-muted">эсвэл</p>
      </div>

      <GoogleAuthButton label="Google-ээр бүртгүүлэх" />
    </AuthShell>
  )
}

export default RegisterPage
