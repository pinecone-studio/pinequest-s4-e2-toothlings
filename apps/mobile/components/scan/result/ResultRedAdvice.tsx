import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'

type Props = { guardianPhone?: string }

export default function ResultRedAdvice({ guardianPhone }: Props) {
  const { colors } = useTheme()
  const router = useRouter()

  const callEmergency = () => Linking.openURL('tel:103')
  const smsGuardian = () => {
    if (!guardianPhone) return
    const body = encodeURIComponent('Шүдний шалгалтын дүн: ЯАРАЛТАЙ. Аль болох хурдан шүдний эмчид хандуулна уу. (Оношилгоо биш, чиглүүлэг)')
    Linking.openURL(`sms:${guardianPhone}?body=${body}`)
  }

  return (
    <View style={s.container}>
      <TouchableOpacity style={[s.emergencyBtn, { backgroundColor: colors.triageRedText }]} onPress={callEmergency}>
        <Text style={s.emergencyText}>🏥 Эмчтэй яаралтай холбогдох</Text>
      </TouchableOpacity>
      <View style={[s.clinicCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[s.clinicIcon, { backgroundColor: colors.triageRedBg }]}>
          <Text style={s.pin}>📍</Text>
        </View>
        <View style={s.clinicInfo}>
          <Text style={[s.clinicName, { color: colors.textBase }]}>Сумын эрүүл мэндийн төв</Text>
          <Text style={[s.clinicSub, { color: colors.textMuted }]}>Нээлттэй байна</Text>
        </View>
        <TouchableOpacity style={[s.callBtn, { backgroundColor: colors.primary }]} onPress={callEmergency}>
          <Text style={[s.callBtnText, { color: colors.primaryText }]}>Залгах</Text>
        </TouchableOpacity>
      </View>
      {!!guardianPhone && (
        <TouchableOpacity style={[s.smsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={smsGuardian}>
          <Text style={[s.smsBtnText, { color: colors.textBase }]}>📱 Эцэг эхэд мессеж илгээх</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[s.hospitalBtn, { backgroundColor: colors.triageRedBg }]} onPress={() => router.push('/(tabs)/hospital' as never)}>
        <Text style={[s.hospitalBtnText, { color: colors.triageRedText }]}>Ойр эмнэлэг хайх</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container: { gap: 10 },
  emergencyBtn: { borderRadius: 16, padding: 18, alignItems: 'center' },
  emergencyText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  clinicCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 12, borderWidth: 1 },
  clinicIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  pin: { fontSize: 18 },
  clinicInfo: { flex: 1 },
  clinicName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  clinicSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  callBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  callBtnText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  smsBtn: { borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  smsBtnText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  hospitalBtn: { borderRadius: 14, padding: 14, alignItems: 'center' },
  hospitalBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
})
