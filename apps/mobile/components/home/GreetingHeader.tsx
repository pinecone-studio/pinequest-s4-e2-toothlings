import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

type Props = {
  name: string
  onPressAvatar?: () => void
  syncing?: boolean
  pendingCount?: number
  deadCount?: number
}

const GreetingHeader = ({ name, onPressAvatar, syncing, pendingCount = 0, deadCount = 0 }: Props) => {
  const { colors } = useTheme()
  const initial = name.charAt(0).toUpperCase() || 'Б'

  const hasDead = deadCount > 0
  const hasPending = pendingCount > 0

  return (
    <View style={s.root}>
      <View style={s.left}>
        <Text style={[s.greeting, { color: colors.textBase }]}>
          {`Сайн уу, ${name || '…'} 👋`}
        </Text>
        <View style={s.syncRow}>
          {syncing ? (
            <>
              <ActivityIndicator size="small" color={colors.textMuted} style={{ marginRight: 4 }} />
              <Text style={[s.syncText, { color: colors.textMuted }]}>Илгээж байна...</Text>
            </>
          ) : hasDead ? (
            <>
              <Ionicons name="warning-outline" size={14} color="#B83838" />
              <Text style={[s.syncText, { color: '#B83838' }]}>{`${deadCount} шалгалт илгээгдэхгүй байна`}</Text>
            </>
          ) : hasPending ? (
            <>
              <Ionicons name="cloud-upload-outline" size={14} color={colors.textMuted} />
              <Text style={[s.syncText, { color: colors.textMuted }]}>{`${pendingCount} хүлээгдэж байна`}</Text>
            </>
          ) : null}
        </View>
      </View>
      <Pressable
        onPress={onPressAvatar}
        hitSlop={8}
        style={({ pressed }) => [
          s.avatar,
          { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text style={[s.avatarText, { color: colors.primaryText }]}>{initial}</Text>
      </Pressable>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flex: 1, gap: 4 },
  greeting: { fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.3, lineHeight: 30 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 18 },
  syncText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  avatarText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
})

export default GreetingHeader
