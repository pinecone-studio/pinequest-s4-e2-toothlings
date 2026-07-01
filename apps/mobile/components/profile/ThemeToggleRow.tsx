import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme, useThemePref, type ThemePref } from '@/lib/ThemeContext'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']
type Option = { key: ThemePref; label: string; icon: IoniconsName }

const OPTIONS: Option[] = [
  { key: 'system', label: 'Систем', icon: 'phone-portrait-outline' },
  { key: 'light', label: 'Гэрэл', icon: 'sunny-outline' },
  { key: 'dark', label: 'Харанхуй', icon: 'moon-outline' },
]

const ThemeToggleRow = () => {
  const { colors } = useTheme()
  const { pref, setPref } = useThemePref()

  return (
    <View style={[s.row, { borderBottomColor: colors.border }]}>
      <Ionicons name="contrast-outline" size={20} color={colors.textSecondary} style={s.icon} />
      <Text style={[s.label, { color: colors.textBase }]}>Горим</Text>
      <View style={[s.segment, { backgroundColor: colors.btnFill }]}>
        {OPTIONS.map((o) => {
          const active = pref === o.key
          return (
            <TouchableOpacity
              key={o.key}
              onPress={() => setPref(o.key)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={o.label}
              style={[s.pill, active && { backgroundColor: colors.primarySoft }]}
            >
              <Ionicons name={o.icon} size={16} color={active ? colors.primary : colors.textMuted} />
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  icon: { marginRight: 12 },
  label: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15 },
  segment: {
    flexDirection: 'row',
    borderRadius: 9999,
    padding: 2,
  },
  pill: {
    width: 34,
    height: 28,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default ThemeToggleRow
