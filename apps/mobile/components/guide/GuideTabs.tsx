import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

export type GuideTab = 'guide' | 'history'

type Props = {
  active: GuideTab
  onChange: (tab: GuideTab) => void
}

const TABS: { id: GuideTab; label: string }[] = [
  { id: 'guide', label: 'Шүд угаах заавар' },
  { id: 'history', label: 'Шүд угаасан ханалт' },
]

export default function GuideTabs({ active, onChange }: Props) {
  const { colors } = useTheme()

  return (
    <View style={[s.container, { borderBottomColor: colors.border }]}>
      <View style={[s.row, { backgroundColor: colors.surfaceRaised }]}>
        {TABS.map(({ id, label }) => {
          const isActive = active === id
          return (
            <TouchableOpacity
              key={id}
              style={[s.tab, isActive && { backgroundColor: colors.surface }]}
              onPress={() => onChange(id)}
              activeOpacity={0.8}
            >
              <Text style={[s.tabText, { color: isActive ? colors.textBase : colors.textMuted }]}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  row: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  tab: { flex: 1, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 4, alignItems: 'center' },
  tabText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
})
