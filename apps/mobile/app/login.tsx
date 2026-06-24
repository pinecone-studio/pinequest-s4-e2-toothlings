'use no memo'
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { saveToken, saveUser, type AuthUser } from '@/lib/auth'

type AuthData = { token: string; user: AuthUser }

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<AuthData>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      await saveToken(data.token)
      await saveUser(data.user)
      router.replace('/(tabs)')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.card}>
        <Text style={s.title}>Screener</Text>
        <Text style={s.sub}>Хүүхдийн шүд ба амны хөндийн скиринг</Text>
        <TextInput
          style={s.input}
          placeholder="Имэйл"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={s.input}
          placeholder="Нууц үг"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={s.error}>{error}</Text> : null}
        <TouchableOpacity style={s.btn} onPress={onSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>Нэвтрэх</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center' },
  card: { margin: 24, backgroundColor: '#fff', borderRadius: 16, padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#1e293b', textAlign: 'center' },
  sub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 16 },
  error: { color: '#ef4444', fontSize: 14 },
  btn: { backgroundColor: '#1e293b', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})
