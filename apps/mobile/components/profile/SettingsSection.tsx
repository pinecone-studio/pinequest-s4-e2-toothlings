import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'
import { clearToken, clearUser } from '@/lib/auth'
import SettingsRow from './SettingsRow'
import ThemeToggleRow from './ThemeToggleRow'

const SettingsSection = () => {
  const { colors } = useTheme()
  const router = useRouter()

  const logout = async () => {
    await clearToken()
    await clearUser()
    router.replace('/login')
  }

  return (
    <View>
      <Text style={[s.sectionTitle, { color: colors.textMuted }]}>ТОХИРГОО</Text>
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ThemeToggleRow />
        <SettingsRow
          icon="globe-outline"
          label="Хэл"
          value="Монгол"
        />
        <SettingsRow
          icon="cloud-download-outline"
          label="Оффлайн өгөгдөл"
          value="Хадгалсан"
          valueColor={colors.triageGreenText}
        />
        <SettingsRow
          icon="chatbubble-ellipses-outline"
          label="Тусламж"
          showChevron
          onPress={() => router.push('/(tabs)/hospital')}
        />
      </View>
      <TouchableOpacity
        style={[s.logoutBtn, { borderColor: colors.triageRedText }]}
        onPress={logout}
        activeOpacity={0.8}
      >
        <Text style={[s.logoutText, { color: colors.triageRedText }]}>Гарах</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
    paddingTop: 20,
    paddingBottom: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  logoutBtn: {
    marginTop: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
})

export default SettingsSection
