import { useState } from 'react'
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import { useSession } from '@/lib/SessionContext'
import { ROLE_LABEL } from '@/lib/roleConfig'

// Compact role switcher shown next to the role label in the profile header.
// Only a dual-role registration (Багш + Эцэг эх) can switch; one tap re-scopes
// the session (staff ⇄ parent) via the server /auth/switch-role.
const RoleSwitchButton = () => {
  const { colors } = useTheme()
  const { baseRole, activeRole, canSwitchRole, switchRole } = useSession()
  const [busy, setBusy] = useState(false)

  if (!canSwitchRole || !baseRole) return null

  const current = activeRole ?? baseRole
  // The role we'll switch TO on tap, and its label.
  const target: 'parent' | 'self' = current === 'parent' ? 'self' : 'parent'
  const targetRole = current === 'parent' ? baseRole : 'parent'

  const onPress = async () => {
    if (busy) return
    setBusy(true)
    try {
      await switchRole(target)
    } catch {
      // keep current role on failure
    } finally {
      setBusy(false)
    }
  }

  return (
    <TouchableOpacity
      style={[s.pill, { backgroundColor: colors.primary + '18', borderColor: colors.primary }]}
      onPress={onPress}
      disabled={busy}
      activeOpacity={0.7}
    >
      {busy ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          <Ionicons name="swap-horizontal" size={14} color={colors.primary} />
          <Text style={[s.label, { color: colors.primary }]}>{ROLE_LABEL[targetRole] ?? targetRole}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 9999, borderWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
})

export default RoleSwitchButton
