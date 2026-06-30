import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

const WEEKDAYS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня']
const MONTHS = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар']

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

type Props = { value: Date | null; onChange: (d: Date) => void; minDate?: Date }

/** Dependency-free month grid date picker (Monday-first, future-only by default). */
const MonthCalendar = ({ value, onChange, minDate }: Props) => {
  const { colors } = useTheme()
  const initial = value ?? new Date()
  const [view, setView] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1))
  const floor = minDate ?? new Date(new Date().setHours(0, 0, 0, 0))

  const year = view.getFullYear()
  const month = view.getMonth()
  const offset = (new Date(year, month, 1).getDay() + 6) % 7
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]

  const shift = (n: number) => setView(new Date(year, month + n, 1))

  return (
    <View style={[s.card, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
      <View style={s.head}>
        <TouchableOpacity onPress={() => shift(-1)} hitSlop={10}><Ionicons name="chevron-back" size={20} color={colors.textBase} /></TouchableOpacity>
        <Text style={[s.month, { color: colors.textBase }]}>{year} {MONTHS[month]}</Text>
        <TouchableOpacity onPress={() => shift(1)} hitSlop={10}><Ionicons name="chevron-forward" size={20} color={colors.textBase} /></TouchableOpacity>
      </View>
      <View style={s.weekRow}>
        {WEEKDAYS.map((w) => <Text key={w} style={[s.weekday, { color: colors.textMuted }]}>{w}</Text>)}
      </View>
      <View style={s.grid}>
        {cells.map((day, i) => {
          if (day === null) return <View key={`e${i}`} style={s.cell} />
          const date = new Date(year, month, day)
          const disabled = date < floor
          const selected = value ? sameDay(date, value) : false
          return (
            <TouchableOpacity
              key={day}
              style={s.cell}
              disabled={disabled}
              onPress={() => onChange(date)}
              activeOpacity={0.7}
            >
              <View style={[s.dayPill, selected && { backgroundColor: colors.primary }]}>
                <Text style={[s.dayText, { color: selected ? colors.primaryText : disabled ? colors.textDisabled : colors.textBase }]}>{day}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, fontFamily: 'Inter_500Medium' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayPill: { width: 34, height: 34, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
})

export default MonthCalendar
