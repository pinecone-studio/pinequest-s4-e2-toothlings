import { useEffect, useRef, useState } from 'react'
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

export type GuideTab = 'guide' | 'history'

type Props = {
  active: GuideTab
  onChange: (tab: GuideTab) => void
}

const TABS: { id: GuideTab; label: string }[] = [
  { id: 'guide', label: 'Шүд угаах заавар' },
  { id: 'history', label: 'Шүд угаах ханалт' },
]

const TAB_PAD = 4

export default function GuideTabs({ active, onChange }: Props) {
  const { colors } = useTheme()
  const [rowW, setRowW] = useState(0)
  // 0 = guide (left), 1 = history (right) — drives the sliding yellow pill.
  const pill = useRef(new Animated.Value(0)).current

  const activeIndex = TABS.findIndex((t) => t.id === active)

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
        {TABS.map(({ id, label }) => {
          const isActive = active === id
          return (
            <TouchableOpacity
              key={id}
              style={s.tab}
              onPress={() => onChange(id)}
              activeOpacity={0.8}
            >
              <Text
                style={[s.tabText, { color: isActive ? colors.primaryText : colors.textMuted }]}
              >
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
    padding: TAB_PAD,
    borderWidth: StyleSheet.hairlineWidth,
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
    borderRadius: 9999,
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
})
