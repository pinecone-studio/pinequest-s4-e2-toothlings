import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'

export default function ResultDisclaimer() {
  const { colors } = useTheme()
  return (
    <View style={[s.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[s.text, { color: colors.textMuted }]}>
        ℹ️ Энэ нь оношилгоо биш - анхан шатны чиглүүлэг болно.
      </Text>
    </View>
  )
}

const s = StyleSheet.create({
  box: { borderRadius: 14, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  text: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
})
