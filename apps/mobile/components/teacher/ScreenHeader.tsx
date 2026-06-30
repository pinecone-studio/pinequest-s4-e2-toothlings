import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'

type Props = { title: string; subtitle?: string; right?: React.ReactNode }

const ScreenHeader = ({ title, subtitle, right }: Props) => {
  const { colors } = useTheme()
  const router = useRouter()
  return (
    <View style={s.row}>
      <TouchableOpacity style={[s.back, { borderColor: colors.border }]} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={20} color={colors.textBase} />
      </TouchableOpacity>
      <View style={s.titles}>
        <Text style={[s.title, { color: colors.textBase }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[s.sub, { color: colors.textMuted }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right ?? <View style={s.spacer} />}
    </View>
  )
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  back: { width: 40, height: 40, borderRadius: 9999, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1 },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  sub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  spacer: { width: 40 },
})

export default ScreenHeader
