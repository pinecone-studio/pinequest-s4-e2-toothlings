import { Modal, View, Text, Image, TouchableOpacity, TouchableWithoutFeedback, ScrollView, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import { lightColors, darkColors, type ColorTokens } from '@/lib/theme'
import { useSession } from '@/lib/SessionContext'
import { ROLE_LABEL } from '@/lib/roleConfig'
import RoleSwitchButton from './RoleSwitchButton'
import { realEmail } from './EditProfileSheet'
import type { MeResult } from '@/lib/api'

type Props = {
  visible: boolean
  me: MeResult
  onClose: () => void
  onEdit: () => void
}

// Read view of the signed-in user's profile (name / email / role), opened from
// the small avatar in the profile-tab header. Presented as a bottom sheet (same
// slide-up pattern as the register form / EditProfileSheet). "Засах" hands off
// to EditProfileSheet.
const ProfileModal = ({ visible, me, onClose, onEdit }: Props) => {
  // Overlay sheets use the canonical opaque palette, never a screen-specific
  // skin (e.g. Home's glass `surface` is translucent and bleeds the page through).
  const { dark } = useTheme()
  const colors = dark ? darkColors : lightColors
  const { activeRole } = useSession()
  const role = ROLE_LABEL[activeRole ?? me.role] ?? me.role

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.fill}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={s.backdrop} />
        </TouchableWithoutFeedback>
        <View style={[s.sheet, { backgroundColor: colors.surface }]}>
          <View style={[s.grabber, { backgroundColor: colors.border }]} />
          <View style={s.head}>
            <Text style={[s.title, { color: colors.textBase }]}>Миний мэдээлэл</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8} style={[s.closeBtn, { backgroundColor: colors.bg }]} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
            {me.avatarUrl ? (
              <Image source={{ uri: me.avatarUrl }} style={s.avatarImg} />
            ) : (
              <View style={[s.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[s.avatarText, { color: colors.primaryText }]}>{me.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}

            <Field label="НЭР" value={me.name} colors={colors} />
            <Field label="И-МЭЙЛ" value={realEmail(me.email) || me.phone || '—'} colors={colors} />
            <View style={[s.field, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <Text style={[s.fieldLabel, { color: colors.textMuted }]}>ЭРХ</Text>
              <View style={s.roleRow}>
                <Text style={[s.fieldValue, { color: colors.textBase }]} numberOfLines={1}>{role}</Text>
                <RoleSwitchButton />
              </View>
            </View>

            <TouchableOpacity style={[s.editBtn, { backgroundColor: colors.bg, borderColor: colors.border }]} onPress={onEdit} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={18} color={colors.textBase} />
              <Text style={[s.editText, { color: colors.textBase }]}>Засах</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const Field = ({ label, value, colors }: { label: string; value: string; colors: ColorTokens }) => {
  return (
    <View style={[s.field, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[s.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[s.fieldValue, { color: colors.textBase }]} numberOfLines={1}>{value}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 8 },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 22, paddingTop: 8, gap: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  avatarImg: { width: 88, height: 88, borderRadius: 44, alignSelf: 'center', marginVertical: 8 },
  avatarText: { fontSize: 36, fontFamily: 'Inter_700Bold' },
  field: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
  fieldLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, textTransform: 'uppercase' },
  fieldValue: { fontSize: 16, fontFamily: 'Inter_500Medium', flexShrink: 1 },
  roleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingVertical: 14, marginTop: 4 },
  editText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
})

export default ProfileModal
