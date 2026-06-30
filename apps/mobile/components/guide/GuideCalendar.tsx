import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

const DAY_HEADERS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня']
const HIGHLIGHT_DAY = 3

// July 2026: July 1 = Wednesday (Mon-indexed = 2), 31 days
function buildRows(): (number | null)[][] {
  const cells: (number | null)[] = Array(2).fill(null)
  for (let d = 1; d <= 31; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

const ROWS = buildRows()

export default function GuideCalendar() {
  const { colors } = useTheme()

  return (
    <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[s.monthLabel, { color: colors.primary }]}>2026 оны 7 сар</Text>
      <View style={s.weekRow}>
        {DAY_HEADERS.map((d) => (
          <Text key={d} style={[s.dayHeader, { color: colors.textMuted }]}>{d}</Text>
        ))}
      </View>
      {ROWS.map((row, ri) => (
        <View key={ri} style={s.weekRow}>
          {row.map((day, di) => {
            const isHighlight = day === HIGHLIGHT_DAY
            return (
              <View
                key={di}
                style={[s.dayCell, isHighlight && { backgroundColor: colors.primary, borderRadius: 20 }]}
              >
                {day !== null && (
                  <Text style={[s.dayText, { color: isHighlight ? colors.primaryText : colors.textBase }]}>
                    {day}
                  </Text>
                )}
              </View>
            )
          })}
        </View>
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, borderWidth: StyleSheet.hairlineWidth },
  monthLabel: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 10 },
  weekRow: { flexDirection: 'row' },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontFamily: 'Inter_600SemiBold', paddingVertical: 5 },
  dayCell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  dayText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
})
