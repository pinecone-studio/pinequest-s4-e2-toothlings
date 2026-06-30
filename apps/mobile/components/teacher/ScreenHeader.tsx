import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import BackButton from '@/components/BackButton'

type Props = { title: string; subtitle?: string; right?: React.ReactNode }

const ScreenHeader = ({ title, subtitle, right }: Props) => {
  const { colors } = useTheme()
  return (
    <View style={s.row}>
      <BackButton />
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
  titles: { flex: 1 },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  sub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  spacer: { width: 40 },
})

export default ScreenHeader
