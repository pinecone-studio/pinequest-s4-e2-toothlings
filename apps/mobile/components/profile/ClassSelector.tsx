import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import { MOCK_CLASSES } from '@/lib/profileData'

type Props = {
  selected: string | null
  onSelect: (cls: string) => void
}

const ClassSelector = ({ selected, onSelect }: Props) => {
  const { colors } = useTheme()

  return (
    <View style={[s.wrap, { borderBottomColor: colors.border }]}>
      <Text style={[s.label, { color: colors.textMuted }]}>Анги сонгох</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.row}
      >
        {MOCK_CLASSES.map((cls) => {
          const active = cls === selected
          return (
            <TouchableOpacity
              key={cls}
              style={[
                s.chip,
                {
                  backgroundColor: active ? colors.primary : colors.surfaceRaised,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onSelect(cls)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  s.chipText,
                  { color: active ? colors.primaryText : colors.textSecondary },
                ]}
              >
                {cls}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  row: { paddingHorizontal: 12, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
})

export default ClassSelector
