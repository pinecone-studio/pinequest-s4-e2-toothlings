import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import { useModelStatus } from '@/lib/useModelPrefetch'
import { downloadModel } from '@/lib/localInference'
import { MODEL_URL } from '@/lib/config'

/**
 * Tells the user where the on-device model stands, so they know when a fully
 * offline scan is possible (the download is otherwise silent). No live percentage:
 * expo-file-system's progress callback floods the log, so we show state only.
 */
const ModelStatusBanner = () => {
  const { colors } = useTheme()
  const status = useModelStatus()

  if (status === 'idle') return null

  if (status === 'downloading') {
    return (
      <View style={[s.row, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[s.text, { color: colors.textBase }]}>
          Офлайн загвар татаж байна… дуустал интернэттэй байна уу.
        </Text>
      </View>
    )
  }

  if (status === 'ready') {
    return (
      <View style={[s.row, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
        <Ionicons name="cloud-done-outline" size={18} color={colors.triageGreenText} />
        <Text style={[s.text, { color: colors.textBase }]}>Офлайн скрининг бэлэн</Text>
      </View>
    )
  }

  // error — tap to retry the download
  return (
    <TouchableOpacity
      style={[s.row, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}
      onPress={() => { if (MODEL_URL) void downloadModel(MODEL_URL).catch(() => {}) }}
      activeOpacity={0.8}
    >
      <Ionicons name="alert-circle-outline" size={18} color={colors.triageRedText} />
      <Text style={[s.text, { color: colors.textBase }]}>Загвар татаж чадсангүй. Дахин оролдохын тулд дарна уу.</Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium' },
})

export default ModelStatusBanner
