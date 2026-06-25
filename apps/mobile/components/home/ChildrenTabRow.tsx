import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Child = { id: string; name: string }

type Props = { children: Child[]; activeId: string; onSelect: (id: string) => void }

const ChildrenTabRow = ({ children, activeId, onSelect }: Props) => {
  const { colors } = useTheme()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.row}
    >
      {children.map((child) => {
        const active = child.id === activeId
        return (
          <TouchableOpacity
            key={child.id}
            onPress={() => onSelect(child.id)}
            style={[
              s.tab,
              {
                backgroundColor: active ? colors.primary : colors.surfaceRaised,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                s.label,
                { color: active ? colors.primaryText : colors.textBase },
              ]}
            >
              {child.name}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 2 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
  },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
})

export default ChildrenTabRow
