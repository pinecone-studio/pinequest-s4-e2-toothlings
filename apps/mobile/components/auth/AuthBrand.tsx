import { View, Text, Image, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = { subtitle: string }

const AuthBrand = ({ subtitle }: Props) => {
  const { colors, dark } = useTheme()
  const logo = dark
    ? require('../../assets/logoYellow.png')
    : require('../../assets/logoBlack.png')
  return (
    <View style={s.root}>
      <View style={s.nameCol}>
        <Image source={logo} style={s.mark} resizeMode="contain" />
        <Text style={[s.name, { color: colors.textBase }]}>TOOTHLINGS</Text>
      </View>
      <Text style={[s.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  root: { gap: 8, alignItems: 'center' },
  nameCol: { alignItems: 'center', gap: 10 },
  mark: { width: 150, height: 100, borderRadius: 20 },
  name: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22, textAlign: 'center' },
})

export default AuthBrand
