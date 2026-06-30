import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useState, useRef } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { getDoctor } from '@/lib/doctorsData'
import BackButton from '@/components/BackButton'
import ChatBubble from '@/components/hospital/ChatBubble'
import ChatInputBar from '@/components/hospital/ChatInputBar'

type Msg = { id: string; text: string; isMe: boolean; time: string }

const SEED_MSGS: Msg[] = [
  { id: '1', text: 'Сайн байна уу? Юу тусалж чадах вэ?', isMe: false, time: '14:30' },
  { id: '2', text: 'Манай хүүхдийн шүдэнд асуулт байна.', isMe: true, time: '14:31' },
  { id: '3', text: 'Мэдээж. Ямар шинж тэмдэг ажиглаж байна вэ?', isMe: false, time: '14:31' },
]

const ChatScreen = () => {
  const { colors } = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const doctor = getDoctor(id)
  const [messages, setMessages] = useState<Msg[]>(SEED_MSGS)
  const scrollRef = useRef<ScrollView>(null)

  const send = (text: string) => {
    const now = new Date()
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
    setMessages((prev) => [...prev, { id: String(Date.now()), text, isMe: true, time }])
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)
  }

  if (!doctor) return null

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <BackButton />
        <View style={s.headerCenter}>
          <Text style={[s.doctorName, { color: colors.textBase }]}>{doctor.name}</Text>
          <Text style={[s.doctorRole, { color: colors.textMuted }]}>{doctor.specialty}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: '/hospital/call', params: { id } })}>
          <Ionicons name="videocam-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.msgs}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => (
          <ChatBubble key={m.id} text={m.text} isMe={m.isMe} time={m.time} />
        ))}
      </ScrollView>
      <ChatInputBar onSend={send} />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerCenter: { alignItems: 'center' },
  doctorName: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  doctorRole: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  msgs: { paddingVertical: 16 },
})

export default ChatScreen
