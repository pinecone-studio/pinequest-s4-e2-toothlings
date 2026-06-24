import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'

type TriageLevel = 'green' | 'yellow' | 'red'

const LEVEL: Record<TriageLevel, { label: string; color: string; bg: string; message: string }> = {
  green: {
    label: 'Нормаль',
    color: '#166534',
    bg: '#dcfce7',
    message:
      'Шүдний байдал хэвийн байна. Жилд нэгээс доошгүй удаа шүдний эмчид хяналт хийлгэнэ үү.',
  },
  yellow: {
    label: 'Хянах шаардлагатай',
    color: '#854d0e',
    bg: '#fef9c3',
    message:
      'Хүүхдийн шүдэнд анхаарах асуудал илэрлээ. Ойрын хугацаанд шүдний эмчид үзүүлнэ үү.',
  },
  red: {
    label: 'Яаралтай эмчид хандах',
    color: '#991b1b',
    bg: '#fee2e2',
    message:
      'Хүүхдийн шүдэнд ноцтой асуудал илэрлээ. Аль болох богино хугацаанд шүдний эмчид хандах хэрэгтэй.',
  },
}

export default function ResultScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    triageLevel: string
    triageScore: string
    detectionsCount: string
    screeningId: string
  }>()

  const level = (params.triageLevel ?? 'green') as TriageLevel
  const cfg = LEVEL[level] ?? LEVEL.green
  const count = Number(params.detectionsCount ?? '0')
  const score = Number(params.triageScore ?? '0')

  return (
    <SafeAreaView style={s.root}>
      <View style={[s.badge, { backgroundColor: cfg.bg }]}>
        <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
      <Text style={s.message}>{cfg.message}</Text>
      <View style={s.meta}>
        <Text style={s.metaText}>{count} илрэл олдлоо</Text>
        <Text style={s.metaText}>Оноо: {score.toFixed(2)}</Text>
      </View>
      <View style={s.actions}>
        <TouchableOpacity style={s.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={s.homeBtnText}>Нүүр хуудас руу буцах</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.retakeBtn} onPress={() => router.back()}>
          <Text style={s.retakeBtnText}>Дахин авах</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc', padding: 24 },
  badge: { borderRadius: 16, padding: 20, alignItems: 'center', marginVertical: 20 },
  badgeText: { fontSize: 22, fontWeight: '800' },
  message: { fontSize: 16, color: '#334155', lineHeight: 24, marginBottom: 20 },
  meta: { flexDirection: 'row', gap: 20, marginBottom: 32 },
  metaText: { fontSize: 14, color: '#64748b' },
  actions: { gap: 12 },
  homeBtn: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, alignItems: 'center' },
  homeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  retakeBtn: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  retakeBtnText: { color: '#475569', fontWeight: '600', fontSize: 15 },
})
