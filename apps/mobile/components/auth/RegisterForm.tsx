import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuth } from '@/lib/useAuth'
import { useTheme } from '@/lib/ThemeContext'
import RoleChips, { type RoleKey } from './RoleChips'
import TextField from './TextField'
import PhoneField from './PhoneField'
import PinField from './PinField'
import PrimaryButton from './PrimaryButton'

const INST_TYPES = ['Сургууль', 'Цэцэрлэг', 'Бусад'] as const
type InstType = (typeof INST_TYPES)[number]

const NEEDS_SCHOOL: RoleKey[] = ['teacher', 'school_doctor']

const RegisterForm = () => {
  const { submit, busy, error } = useAuth()
  const { colors } = useTheme()
  const [role, setRole] = useState<RoleKey>('parent')
  const [instType, setInstType] = useState<InstType>('Сургууль')
  const [name, setName] = useState('')
  const [extra, setExtra] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({})

  const needsSchool = NEEDS_SCHOOL.includes(role)
  const schoolName = instType === 'Бусад' ? extra.trim() : `${instType} ${extra.trim()}`.trim()

  const clearFieldErr = (k: string) => setFieldErr((p) => ({ ...p, [k]: '' }))

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Нэрээ оруулна уу'
    if (needsSchool && !extra.trim())
      e.extra = instType === 'Бусад' ? 'Байгууллагын нэрээ оруулна уу' : 'Дугаараа оруулна уу'
    if (role === 'parent' && !extra.trim()) e.extra = 'Хүүхдийн нэрийг оруулна уу'
    if (!phone.trim()) e.phone = 'Утасны дугаараа оруулна уу'
    if (password.length < 6) e.password = '6+ тэмдэгт нууц үг оруулна уу'
    if (!confirm) e.confirm = 'Нууц үгээ давтана уу'
    else if (password !== confirm) e.confirm = 'Нууц үг таарахгүй байна'
    return e
  }

  const onRegister = () => {
    const e = validate()
    setFieldErr(e)
    if (Object.keys(e).length) return
    submit('/api/auth/register', {
      name: name.trim(),
      phone: `+976${phone.trim()}`,
      email: email.trim() || undefined,
      password,
      role,
      ...(needsSchool ? { schoolName } : {}),
      ...(role === 'parent' ? { childName: extra.trim() } : {}),
    })
  }

  return (
    <View style={s.root}>
      <View style={s.roleBlock}>
        <Text style={[s.sectionLabel, { color: colors.textMuted }]}>ТАНЫ ҮҮРЭГ</Text>
        <RoleChips
          selected={role}
          onSelect={(k) => {
            setRole(k)
            setExtra('')
            clearFieldErr('extra')
          }}
        />
      </View>

      <View>
        <TextField
          label="БҮТЭН НЭР"
          value={name}
          onChange={(v) => { setName(v); clearFieldErr('name') }}
          placeholder="Нэрээ оруулах"
        />
        {fieldErr.name ? <Text style={s.err}>{fieldErr.name}</Text> : null}
      </View>

      {needsSchool && (
        <View style={s.group}>
          <View style={s.instRow}>
            {INST_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  s.instChip,
                  {
                    borderColor: instType === t ? colors.primary : colors.border,
                    backgroundColor: instType === t ? colors.primary + '22' : 'transparent',
                  },
                ]}
                onPress={() => { setInstType(t); setExtra(''); clearFieldErr('extra') }}
                activeOpacity={0.75}
              >
                <Text style={[s.instChipLabel, { color: instType === t ? colors.primary : colors.textMuted }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextField
            label={instType === 'Бусад' ? 'БАЙГУУЛЛАГЫН НЭР' : 'ДУГААР'}
            value={extra}
            onChange={(v) => { setExtra(v); clearFieldErr('extra') }}
            placeholder={instType === 'Бусад' ? 'Байгууллагын нэр' : 'Дугаар'}
            keyboard={instType !== 'Бусад' ? 'numeric' : undefined}
          />
          {fieldErr.extra ? <Text style={s.err}>{fieldErr.extra}</Text> : null}
        </View>
      )}

      {role === 'parent' && (
        <View>
          <TextField
            label="ХҮҮХДИЙН НЭР"
            value={extra}
            onChange={(v) => { setExtra(v); clearFieldErr('extra') }}
            placeholder="Хүүхдийн нэр"
          />
          {fieldErr.extra ? <Text style={s.err}>{fieldErr.extra}</Text> : null}
        </View>
      )}

      <View>
        <PhoneField value={phone} onChange={(v) => { setPhone(v); clearFieldErr('phone') }} />
        {fieldErr.phone ? <Text style={s.err}>{fieldErr.phone}</Text> : null}
      </View>

      <TextField
        label="И-МЭЙ ХАЯГ (заавал биш)"
        value={email}
        onChange={setEmail}
        placeholder="name@example.com"
        keyboard="email-address"
        autoCapitalize="none"
      />

      <View>
        <PinField
          label="НУУЦ ҮГ"
          hint="хамгийн багадаа 6 тэмдэгт"
          value={password}
          onChange={(v) => { setPassword(v); clearFieldErr('password') }}
        />
        {fieldErr.password ? <Text style={s.err}>{fieldErr.password}</Text> : null}
      </View>

      <View>
        <PinField
          label="НУУЦ ҮГ ДАВТАХ"
          value={confirm}
          onChange={(v) => { setConfirm(v); clearFieldErr('confirm') }}
        />
        {fieldErr.confirm ? <Text style={s.err}>{fieldErr.confirm}</Text> : null}
      </View>

      {error ? <Text style={s.err}>{error}</Text> : null}

      <PrimaryButton label="Бүртгүүлэх" onPress={onRegister} loading={busy} disabled={busy} />
    </View>
  )
}

const s = StyleSheet.create({
  root: { gap: 14 },
  roleBlock: { gap: 8 },
  group: { gap: 10 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  instRow: { flexDirection: 'row', gap: 8 },
  instChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  instChipLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  err: { marginTop: 2, fontSize: 12, color: '#ef4444' },
})

export default RegisterForm
