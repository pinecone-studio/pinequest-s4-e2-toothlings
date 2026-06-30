import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

type Props = {
  text: string
  isMe: boolean
  time: string
}

const ChatBubble = ({ text, isMe, time }: Props) => {
  const { colors } = useTheme()

  return (
    <View style={[s.row, isMe ? s.rowMe : s.rowThem]}>
      <View
        style={[
          s.bubble,
          isMe
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
        ]}
      >
        <Text style={[s.text, { color: isMe ? colors.primaryText : colors.textBase }]}>
          {text}
        </Text>
      </View>
      <Text style={[s.time, { color: colors.textDisabled }]}>{time}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  row: { marginHorizontal: 16, marginBottom: 12 },
  rowMe: { alignItems: 'flex-end' },
  rowThem: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  text: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22 },
  time: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
})

export default ChatBubble
