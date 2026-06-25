import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { getUser, clearToken, clearUser, type AuthUser } from '@/lib/auth'

const ROLE_LABEL: Record<string, string> = {
  screener: 'Скрининг хийгч (шүдний бус)',
  dentist: 'Шүдний эмч',
  follow_up: 'Дагах ажилтан',
  admin: 'Администратор',
}

export default function ProfileScreen() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    getUser().then(setUser)
  }, [])

  const logout = async () => {
    await clearToken()
    await clearUser()
    router.replace('/login')
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.card}>
        <Text style={s.title}>Профайл</Text>
        {user ? (
          <>
            <Text style={s.name}>{user.name}</Text>
            <Text style={s.role}>{ROLE_LABEL[user.role] ?? user.role}</Text>
          </>
        ) : null}
      </View>
      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Гарах</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 20, gap: 6, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  name: { fontSize: 16, color: '#334155' },
  role: { fontSize: 14, color: '#64748b' },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
})
