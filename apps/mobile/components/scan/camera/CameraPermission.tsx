import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { onRequest: () => void }

export default function CameraPermission({ onRequest }: Props) {
  const { colors } = useTheme()
  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <Text style={s.icon}>📷</Text>
      <Text style={[s.title, { color: colors.textBase }]}>Камерын зөвшөөрөл шаардлагатай</Text>
      <Text style={[s.desc, { color: colors.textMuted }]}>
        Шүдний зургийг авахын тулд камерыг ашиглана.
      </Text>
      <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary }]} onPress={onRequest} activeOpacity={0.85}>
        <Text style={[s.btnText, { color: colors.primaryText }]}>Зөвшөөрөл өгөх</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  icon: { fontSize: 52 },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  desc: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  btn: { borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 },
  btnText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
})
