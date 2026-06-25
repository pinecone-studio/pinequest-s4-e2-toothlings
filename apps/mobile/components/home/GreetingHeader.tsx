import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

type Props = { name: string; online: boolean }

const GreetingHeader = ({ name, online }: Props) => {
  const { colors } = useTheme()
  const initial = name.charAt(0).toUpperCase() || 'Б'

  return (
    <View style={s.root}>
      <View style={s.left}>
        <Text style={[s.greeting, { color: colors.textBase }]}>
          {`Сайн уу, ${name || '…'} 👋`}
        </Text>
        <View style={[s.badge, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
          <Ionicons
            name={online ? 'cloud-done-outline' : 'cloud-offline-outline'}
            size={13}
            color={colors.textMuted}
          />
          <Text style={[s.badgeText, { color: colors.textMuted }]}>
            {online ? 'Онлайн' : 'Офлайн'}
          </Text>
        </View>
      </View>
      <View style={[s.avatar, { backgroundColor: colors.primary }]}>
        <Text style={[s.avatarText, { color: colors.primaryText }]}>{initial}</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  left: { flex: 1, gap: 8 },
  greeting: { fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.3, lineHeight: 30 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  avatarText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
})

export default GreetingHeader
