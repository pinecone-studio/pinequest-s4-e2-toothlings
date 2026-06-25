import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { saveToken, saveUser, type AuthUser } from '@/lib/auth'
import { useTheme } from '@/lib/ThemeContext'

type AuthData = { token: string; user: AuthUser }

export default function LoginScreen() {
  const router = useRouter()
  const { colors } = useTheme()
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
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.card, { backgroundColor: colors.surface }]}>
        <Text style={[s.title, { color: colors.sidebar }]}>Screener</Text>
        <Text style={[s.sub, { color: colors.textMuted }]}>Хүүхдийн шүд ба амны хөндийн скиринг</Text>
        <TextInput style={[s.input, { borderColor: colors.border }]} placeholder="Имэйл" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={[s.input, { borderColor: colors.border }]} placeholder="Нууц үг" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={s.error}>{error}</Text> : null}
        <TouchableOpacity style={[s.btn, { backgroundColor: colors.sidebar }]} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Нэвтрэх</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center' },
  card: { margin: 24, borderRadius: 16, padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  sub: { fontSize: 14, textAlign: 'center', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  error: { color: '#ef4444', fontSize: 14 },
  btn: { borderRadius: 10, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})
