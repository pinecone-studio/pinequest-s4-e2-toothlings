import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { subtitle: string }

const AuthBrand = ({ subtitle }: Props) => {
  const { colors } = useTheme()
  return (
    <View style={s.root}>
      <View style={s.nameRow}>
        <View style={[s.mark, { backgroundColor: colors.primary }]}>
          <Text style={[s.letter, { color: colors.primaryText }]}>S</Text>
        </View>
        <Text style={[s.name, { color: colors.textBase }]}>Screener</Text>
      </View>
      <Text style={[s.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root: { gap: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  letter: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  name: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22, paddingLeft: 2 },
})

export default AuthBrand
