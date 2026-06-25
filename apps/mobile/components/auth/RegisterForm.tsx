import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { saveToken, saveUser, type AuthUser } from '@/lib/auth'
import { toMongolian } from '@/lib/errorMessages'
import TextField from './TextField'
import PhoneField from './PhoneField'
import PinField from './PinField'
import PrimaryButton from './PrimaryButton'
import OutlineButton from './OutlineButton'

type AuthData = { token: string; user: AuthUser }

const RegisterForm = ({ onBack }: { onBack: () => void }) => {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onRegister = async () => {
    if (!name || !email || !pin) return
    if (pin.length < 6) {
      setError('Нэвтрэх код хамгийн багадаа 6 тэмдэгт байна')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<AuthData>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password: pin, phone: phone ? `+976${phone}` : undefined }),
      })
      await saveToken(data.token)
      await saveUser(data.user)
      router.replace('/(tabs)')
    } catch (err) {
      setError(toMongolian(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={s.root}>
      <TextField label="БҮТЭН НЭР" value={name} onChange={setName} placeholder="Нэрээ оруулах" />
      <TextField
        label="И-МЭЙ ХАЯГ"
        value={email}
        onChange={setEmail}
        placeholder="name@example.com"
        keyboard="email-address"
        autoCapitalize="none"
      />
      <PhoneField value={phone} onChange={setPhone} />
      <PinField value={pin} onChange={setPin} label="НЭВТРЭХ КОД" hint="хамгийн багадаа 6 тэмдэгт" />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <PrimaryButton
        label="Бүртгүүлэх"
        onPress={onRegister}
        loading={loading}
        disabled={!name || !email || pin.length < 6}
      />
      <OutlineButton label="Буцах" onPress={onBack} />
    </View>
  )
}

const s = StyleSheet.create({
  root: { gap: 14 },
  error: { fontSize: 13, color: '#ef4444' },
})

export default RegisterForm
