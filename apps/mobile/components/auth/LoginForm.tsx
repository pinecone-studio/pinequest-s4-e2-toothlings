import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { saveToken, saveUser, type AuthUser } from '@/lib/auth'
import { toMongolian } from '@/lib/errorMessages'
import LoginIdentifierField from './LoginIdentifierField'
import PinField from './PinField'
import PrimaryButton from './PrimaryButton'

type AuthData = { token: string; user: AuthUser }

const LoginForm = () => {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onLogin = async () => {
    if (!phone || !pin) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<AuthData>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: phone, password: pin }),
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
      <LoginIdentifierField value={phone} onChange={setPhone} />
      <PinField value={pin} onChange={setPin} />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <PrimaryButton
        label="Нэвтрэх"
        onPress={onLogin}
        loading={loading}
        disabled={!phone || !pin}
      />
    </View>
  )
}

const s = StyleSheet.create({
  root: { gap: 14 },
  error: { fontSize: 13, color: '#ef4444' },
})

export default LoginForm
