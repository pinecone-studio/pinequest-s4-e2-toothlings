import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useOutboxSync } from '@/lib/useOutboxSync'
import { useTheme } from '@/lib/ThemeContext'

export default function ScanHomeScreen() {
  const router = useRouter()
  const { syncing, lastResult, sync } = useOutboxSync()
  const { colors } = useTheme()

  useFocusEffect(useCallback(() => { void sync() }, [sync]))

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={s.hero}>
        <Text style={[s.title, { color: colors.sidebar }]}>Screener</Text>
        <Text style={[s.sub, { color: colors.textSecondary }]}>Хүүхдийн шүдний скрининг</Text>
        <Text style={[s.desc, { color: colors.textMuted }]}>
          Та (багш, эмч, цэцэрлэгийн ажилтан) гар утасны камераар хүүхдийн шүдийг скрининг хийнэ.
          Энэ нь оношилгоо биш — эмчид чиглүүлэх хэрэгсэл юм.
        </Text>
        {syncing ? <Text style={[s.sync, { color: colors.textMuted }]}>Синк хийж байна…</Text> : null}
        {lastResult && !syncing ? <Text style={[s.sync, { color: colors.textMuted }]}>{lastResult}</Text> : null}
      </View>
      <View style={s.actions}>
        <TouchableOpacity style={[s.scanBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/scan')}>
          <Ionicons name="camera" size={26} color="#fff" />
          <Text style={s.scanBtnText}>Шинэ скрининг эхлүүлэх</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  hero: { flex: 1, justifyContent: 'center', padding: 28 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 4 },
  sub: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  desc: { fontSize: 15, lineHeight: 22 },
  sync: { marginTop: 12, fontSize: 13 },
  actions: { padding: 24 },
  scanBtn: {
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  scanBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
})
