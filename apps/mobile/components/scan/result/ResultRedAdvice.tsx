import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'
import VolunteerDentistPanel from './VolunteerDentistPanel'

type Props = { guardianPhone?: string; childKey?: string }

export default function ResultRedAdvice({ guardianPhone, childKey }: Props) {
  const { colors } = useTheme()
  const router = useRouter()

  const smsGuardian = () => {
    if (!guardianPhone) return
    const body = encodeURIComponent('Шүдний хяналтын дүн: Яаралтай эмчилгээ шаардлагатай ба шүдний эмч онош, эмчилгээг шийдэх болно')
    Linking.openURL(`sms:${guardianPhone}?body=${body}`)
  }

  return (
    <View style={s.container}>
      <View style={s.row}>
        <TouchableOpacity style={[s.btn, { backgroundColor: colors.triageRedText }]} onPress={() => router.push('/(tabs)/hospital' as never)}>
          <Text style={[s.btnText, { color: '#fff' }]}>🏥 Эмчтэй{'\n'}яаралтай холбогдох</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, { backgroundColor: colors.triageRedBg }]} onPress={() => router.push({ pathname: '/(tabs)/hospital' as never, params: { segment: 'map' } })}>
          <Text style={[s.btnText, { color: colors.triageRedText }]}>📍 Ойр{'\n'}эмнэлэг хайх</Text>
        </TouchableOpacity>
      </View>
      {!!guardianPhone && (
        <TouchableOpacity style={[s.smsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={smsGuardian}>
          <Text style={[s.smsBtnText, { color: colors.textBase }]}>📱 Эцэг эхэд мессеж илгээх</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 14, fontFamily: 'Inter_700Bold', textAlign: 'center', lineHeight: 19 },
  smsBtn: { borderRadius: 9999, padding: 14, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth },
  smsBtnText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
})
