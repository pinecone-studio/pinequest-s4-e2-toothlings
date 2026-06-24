import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function ScanHomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={s.root}>
      <View style={s.hero}>
        <Text style={s.title}>Screener</Text>
        <Text style={s.sub}>Хүүхдийн шүдний скрининг</Text>
        <Text style={s.desc}>
          Та (багш, эмч, цэцэрлэгийн ажилтан) гар утасны камераар хүүхдийн шүдийг скрининг хийнэ.
          Энэ нь оношилгоо биш — эмчид чиглүүлэх хэрэгсэл юм.
        </Text>
      </View>
      <View style={s.actions}>
        <TouchableOpacity style={s.scanBtn} onPress={() => router.push('/scan')}>
          <Ionicons name="camera" size={26} color="#fff" />
          <Text style={s.scanBtnText}>Шинэ скрининг эхлүүлэх</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  hero: { flex: 1, justifyContent: 'center', padding: 28 },
  title: { fontSize: 32, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  sub: { fontSize: 18, fontWeight: '600', color: '#334155', marginBottom: 12 },
  desc: { fontSize: 15, color: '#64748b', lineHeight: 22 },
  actions: { padding: 24 },
  scanBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  scanBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
})
