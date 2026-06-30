import { useEffect, useRef, useState } from 'react'
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Segment = 'doctors' | 'map'

type Props = {
  active: Segment
  onChange: (s: Segment) => void
}

const TABS: { value: Segment; label: string }[] = [
  { value: 'doctors', label: 'Эмч' },
  { value: 'map', label: 'Газрын зураг' },
]

const TAB_PAD = 3

const SegmentTabs = ({ active, onChange }: Props) => {
  const { colors } = useTheme()
  const [rowW, setRowW] = useState(0)
  // 0 = doctors (left), 1 = map (right) — drives the sliding yellow pill.
  const pill = useRef(new Animated.Value(0)).current

  const activeIndex = TABS.findIndex((t) => t.value === active)

  useEffect(() => {
    Animated.spring(pill, {
      toValue: activeIndex,
      useNativeDriver: true,
      friction: 9,
      tension: 90,
    }).start()
  }, [activeIndex, pill])

  const pillW = rowW ? (rowW - TAB_PAD * 2) / TABS.length : 0
  const pillX = pill.interpolate({ inputRange: [0, 1], outputRange: [0, pillW] })

  return (
    <View style={[s.container, { borderBottomColor: colors.border }]}>
      <View
        style={[s.row, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}
        onLayout={(e) => setRowW(e.nativeEvent.layout.width)}
      >
        {pillW > 0 && (
          <Animated.View
            style={[
              s.pill,
              { width: pillW, backgroundColor: colors.primary, transform: [{ translateX: pillX }] },
            ]}
          />
        )}
        {TABS.map(({ value, label }) => {
          const isActive = active === value
          return (
            <TouchableOpacity
              key={value}
              style={s.tab}
              onPress={() => onChange(value)}
              activeOpacity={0.8}
            >
              <Text style={[s.label, { color: isActive ? colors.primaryText : colors.textMuted }]}>
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
  row: {
    flexDirection: 'row',
    borderRadius: 9999,
    borderWidth: StyleSheet.hairlineWidth,
    padding: TAB_PAD,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: TAB_PAD,
    left: TAB_PAD,
    bottom: TAB_PAD,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
})

export default SegmentTabs
