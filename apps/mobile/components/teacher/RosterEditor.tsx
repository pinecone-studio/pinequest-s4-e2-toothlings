import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import RosterRow, { type EditableStudent } from './RosterRow'

export const emptyStudent = (): EditableStudent => ({ firstName: '', lastName: '', birthYear: '', guardianEmail: '' })

type Props = { students: EditableStudent[]; onChange: (next: EditableStudent[]) => void }

const RosterEditor = ({ students, onChange }: Props) => {
  const { colors } = useTheme()
  const update = (i: number, v: EditableStudent) => onChange(students.map((st, idx) => (idx === i ? v : st)))
  const remove = (i: number) => onChange(students.filter((_, idx) => idx !== i))
  const add = () => onChange([...students, emptyStudent()])

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={[s.label, { color: colors.textMuted }]}>СУРАГЧИД ({students.length})</Text>
      </View>
      {students.map((st, i) => (
        <RosterRow key={i} index={i} value={st} onChange={(v) => update(i, v)} onRemove={() => remove(i)} />
      ))}
      <TouchableOpacity style={[s.add, { borderColor: colors.primary }]} onPress={add} activeOpacity={0.7}>
        <Ionicons name="add" size={18} color={colors.primary} />
        <Text style={[s.addText, { color: colors.primary }]}>Сурагч нэмэх</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  head: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  add: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: StyleSheet.hairlineWidth, borderRadius: 9999, borderStyle: 'dashed', paddingVertical: 12 },
  addText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
})

export default RosterEditor
