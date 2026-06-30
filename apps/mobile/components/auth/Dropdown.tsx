import { useState } from 'react'
import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

export type DropdownOption<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  label?: string
  value: T
  options: DropdownOption<T>[]
  onChange: (value: T) => void
  placeholder?: string
}

// Tap-to-open select rendered as a centered modal sheet — mirrors the web role dropdown.
const Dropdown = <T extends string>({ label, value, options, onChange, placeholder }: Props<T>) => {
  const { colors } = useTheme()
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <View style={s.group}>
      {label ? <Text style={[s.label, { color: colors.textMuted }]}>{label}</Text> : null}
      <Pressable
        style={[s.trigger, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}
        onPress={() => setOpen(true)}
      >
        <Text style={[s.triggerText, { color: selected ? colors.textBase : colors.textDisabled }]}>
          {selected?.label ?? placeholder ?? ''}
        </Text>
        <Text style={[s.chevron, { color: colors.textMuted }]}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[s.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {options.map((o) => {
                const active = o.value === value
                return (
                  <Pressable
                    key={o.value}
                    style={[s.option, active && { backgroundColor: colors.primary + '1A' }]}
                    onPress={() => { onChange(o.value); setOpen(false) }}
                  >
                    <Text style={[s.optionText, { color: active ? colors.primary : colors.textBase }]}>
                      {o.label}
                    </Text>
                    {active ? <Text style={[s.check, { color: colors.primary }]}>✓</Text> : null}
                  </Pressable>
                )
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  trigger: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: { fontSize: 16, flex: 1 },
  chevron: { fontSize: 14, marginLeft: 8 },
  backdrop: { flex: 1, backgroundColor: '#0006', justifyContent: 'center', paddingHorizontal: 28 },
  sheet: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, maxHeight: '60%', overflow: 'hidden' },
  option: {
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: { fontSize: 16, fontFamily: 'Inter_500Medium' },
  check: { fontSize: 16, fontFamily: 'Inter_700Bold' },
})

export default Dropdown
