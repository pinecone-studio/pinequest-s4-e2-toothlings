import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'

export default function ScanChildScreen() {
  const router = useRouter()
  const [schoolId, setSchoolId] = useState('')
  const [classId, setClassId] = useState('')
  const [seasonId, setSeasonId] = useState('2026-spring')
  const [rosterSlot, setRosterSlot] = useState('')

  const ready = !!schoolId && !!classId && !!rosterSlot

  const onNext = () => {
    if (!ready) return
    // Temporary childKey until the child roster picker is built.
    const childKey = `${schoolId}:${classId}:${rosterSlot}`
    router.push({ pathname: '/scan/camera', params: { childKey, classId, schoolId, seasonId } })
  }

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>Сургуулийн ID</Text>
        <TextInput
          style={s.input}
          value={schoolId}
          onChangeText={setSchoolId}
          placeholder="school-demo"
          autoCapitalize="none"
        />
        <Text style={s.label}>Ангийн ID</Text>
        <TextInput
          style={s.input}
          value={classId}
          onChangeText={setClassId}
          placeholder="class-demo"
          autoCapitalize="none"
        />
        <Text style={s.label}>Улирал</Text>
        <TextInput
          style={s.input}
          value={seasonId}
          onChangeText={setSeasonId}
          placeholder="2026-spring"
          autoCapitalize="none"
        />
        <Text style={s.label}>Суудлын дугаар</Text>
        <TextInput
          style={s.input}
          value={rosterSlot}
          onChangeText={setRosterSlot}
          placeholder="1"
          keyboardType="number-pad"
        />
        <TouchableOpacity style={[s.btn, !ready && s.btnDisabled]} onPress={onNext} disabled={!ready}>
          <Text style={s.btnText}>Камер нээх</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  btn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  btnDisabled: { backgroundColor: '#94a3b8' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
