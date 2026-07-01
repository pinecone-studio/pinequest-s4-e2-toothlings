import { useEffect, useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import { lightColors, darkColors } from '@/lib/theme'
import { updateMe, type ProfileResult } from '@/lib/api'
import { toMongolian } from '@/lib/errorMessages'
import TextField from '@/components/auth/TextField'
import PhoneField from '@/components/auth/PhoneField'
import PrimaryButton from '@/components/auth/PrimaryButton'

const EMAIL_SENTINEL = '@phone.screener.mn'
/** Phone-only accounts carry a synthetic email — never show it as a real address. */
export const realEmail = (email: string | null | undefined): string =>
  email && !email.endsWith(EMAIL_SENTINEL) ? email : ''

/** Strip the +976 prefix for the 8-digit local editor. */
const toLocalPhone = (phone: string | null | undefined): string =>
  (phone ?? '').replace(/^\+976/, '').trim()

type Props = {
  visible: boolean
  initial: { name: string; phone: string | null; email: string | null }
  onClose: () => void
  onSaved: (updated: ProfileResult) => void
}

// A bottom-sheet editor for the user's changeable registration values (name,
// phone, email). Opened from the profile header — no always-visible edit button.
const EditProfileSheet = ({ visible, initial, onClose, onSaved }: Props) => {
  // Opaque palette so the sheet never lets the page behind bleed through a
  // screen-specific glass skin (e.g. Home's translucent `surface`).
  const { dark } = useTheme()
  const colors = dark ? darkColors : lightColors
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Re-seed the form each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setName(initial.name)
      setPhone(toLocalPhone(initial.phone))
      setEmail(realEmail(initial.email))
      setError(null)
    }
  }, [visible, initial.name, initial.phone, initial.email])

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const patch = {
        name: name.trim(),
        phone: phone.trim() ? `+976${phone.trim()}` : '',
        ...(email.trim() ? { email: email.trim() } : {}),
      }
      const updated = await updateMe(patch)
      onSaved(updated)
      onClose()
    } catch (err) {
      setError(toMongolian(err))
    } finally {
      setSaving(false)
    }
  }

  const phoneOk = !phone.trim() || /^\d{8}$/.test(phone.trim())
  const canSave = !!name.trim() && phoneOk

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={s.backdrop} />
        </TouchableWithoutFeedback>
        <View style={[s.sheet, { backgroundColor: colors.surface }]}>
          <View style={[s.grabber, { backgroundColor: colors.border }]} />
          <View style={s.head}>
            <Text style={[s.title, { color: colors.textBase }]}>Мэдээлэл засах</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView
            contentContainerStyle={s.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextField label="БҮТЭН НЭР" value={name} onChange={setName} placeholder="Нэр" />
            <PhoneField value={phone} onChange={setPhone} />
            {!phoneOk ? <Text style={s.error}>Утасны дугаараа шалгана уу</Text> : null}
            <TextField
              label="И-МЭЙЛ ХАЯГ (заавал биш)"
              value={email}
              onChange={setEmail}
              placeholder="name@example.com"
              keyboard="email-address"
              autoCapitalize="none"
            />
            {error ? <Text style={s.error}>{error}</Text> : null}
            <PrimaryButton label="Хадгалах" onPress={save} loading={saving} disabled={!canSave} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const s = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
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
  title: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  body: { paddingHorizontal: 22, paddingTop: 8, gap: 16 },
  error: { fontSize: 13, color: '#ef4444' },
})

export default EditProfileSheet
