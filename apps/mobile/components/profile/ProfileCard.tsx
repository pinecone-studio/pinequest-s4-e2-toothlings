import { useCallback, useState } from 'react'
import { View, Text, Image, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'
import { useSession } from '@/lib/SessionContext'
import { ROLE_LABEL } from '@/lib/roleConfig'
import { getMe, type MeResult, type ProfileResult } from '@/lib/api'
import { getUser, saveUser } from '@/lib/auth'
import { pickAndUploadAvatar } from '@/lib/avatar'
import EditProfileSheet, { realEmail } from './EditProfileSheet'
import RoleSwitchButton from './RoleSwitchButton'

// Inline profile block on the settings screen: shows name / email / role and a
// tappable avatar whose camera badge adds/changes the profile photo (server-
// synced). "Мэдээлэл засах" still opens the text editor for name/phone/email.
const ProfileCard = () => {
  const { colors } = useTheme()
  const { activeRole } = useSession()
  const [me, setMe] = useState<MeResult | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const load = useCallback(() => {
    getMe()
      .then(setMe)
      .catch(async () => {
        const u = await getUser()
        if (u) setMe({ id: u.id, name: u.name, role: u.role, email: '', phone: null, schoolId: u.schoolId ?? null, avatarUrl: null, isActive: true })
      })
  }, [])
  useFocusEffect(load)

  const onAddPhoto = async () => {
    if (uploading) return
    setUploading(true)
    try {
      const updated = await pickAndUploadAvatar()
      if (updated) setMe((prev) => (prev ? { ...prev, avatarUrl: updated.avatarUrl } : prev))
    } catch (e) {
      Alert.alert('Зураг', e instanceof Error ? e.message : 'Зураг оруулж чадсангүй')
    } finally {
      setUploading(false)
    }
  }

  const onSaved = async (updated: ProfileResult) => {
    setMe((prev) => (prev ? { ...prev, name: updated.name, email: updated.email, phone: updated.phone } : prev))
    const u = await getUser()
    if (u) await saveUser({ ...u, name: updated.name })
  }

  if (!me) return null
  const role = ROLE_LABEL[activeRole ?? me.role] ?? me.role
  const contact = realEmail(me.email) || me.phone || '—'

  return (
    <View style={[s.card, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
      <View style={s.row}>
        <Pressable onPress={onAddPhoto} disabled={uploading} style={s.avatarWrap} hitSlop={6}>
          {me.avatarUrl ? (
            <Image source={{ uri: me.avatarUrl }} style={s.avatarImg} />
          ) : (
            <View style={[s.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[s.avatarText, { color: colors.primaryText }]}>{me.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={[s.badge, { backgroundColor: colors.primary, borderColor: colors.surfaceRaised }]}>
            {uploading ? (
              <ActivityIndicator size="small" color={colors.primaryText} />
            ) : (
              <Ionicons name="camera" size={13} color={colors.primaryText} />
            )}
          </View>
        </Pressable>

        <View style={s.info}>
          <Text style={[s.name, { color: colors.textBase }]} numberOfLines={1}>{me.name}</Text>
          <Text style={[s.contact, { color: colors.textMuted }]} numberOfLines={1}>{contact}</Text>
          <View style={s.roleRow}>
            <View style={[s.roleChip, { backgroundColor: colors.primarySoft }]}>
              <Text style={[s.roleText, { color: colors.primary }]}>{role}</Text>
            </View>
            <RoleSwitchButton />
          </View>
        </View>
      </View>

      <Pressable onPress={() => setEditOpen(true)} style={[s.editBtn, { borderColor: colors.border }]} hitSlop={6}>
        <Ionicons name="create-outline" size={16} color={colors.textMuted} />
        <Text style={[s.editText, { color: colors.textMuted }]}>Мэдээлэл засах</Text>
      </Pressable>

      <EditProfileSheet
        visible={editOpen}
        initial={{ name: me.name, phone: me.phone, email: me.email }}
        onClose={() => setEditOpen(false)}
        onSaved={onSaved}
      />
    </View>
  )
}

const s = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrap: { width: 64, height: 64 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 64, height: 64, borderRadius: 32 },
  avatarText: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  badge: {
    position: 'absolute', right: -2, bottom: -2,
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  contact: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  roleChip: { borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 3 },
  roleText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  editText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
})

export default ProfileCard
