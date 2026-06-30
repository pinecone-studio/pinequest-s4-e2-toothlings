import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

type Props = { reportName: string }

const showComingSoon = () =>
  Alert.alert('', 'Энэ функц удахгүй нэмэгдэнэ.', [{ text: 'Ойлголоо' }])

const LatestReport = ({ reportName }: Props) => {
  const { colors } = useTheme()

  return (
    <View>
      <Text style={[s.sectionTitle, { color: colors.textMuted }]}>СҮҮЛИЙН ТАЙЛАН</Text>
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={s.top}>
          <View style={[s.docPreview, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
            <View style={[s.docLine, s.docLineWide, { backgroundColor: colors.triageGreenText }]} />
            <View style={[s.docLine, { backgroundColor: colors.border }]} />
            <View style={[s.docLine, { backgroundColor: colors.border }]} />
            <View style={[s.docLine, s.docLineShort, { backgroundColor: colors.border }]} />
          </View>
          <View style={s.docInfo}>
            <Text style={[s.docTitle, { color: colors.textBase }]}>
              {reportName}-ын шүдний тайлан
            </Text>
            <Text style={[s.docMeta, { color: colors.textMuted }]}>
              2026 оны 6-р сар · 🟡 Анхааруул
            </Text>
            <Text style={[s.docMeta, { color: colors.textMuted }]}>PDF · 2 хуудас</Text>
          </View>
        </View>
        <View style={s.btns}>
          <TouchableOpacity
            style={[s.outlineBtn, { borderColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={showComingSoon}
          >
            <Ionicons name="download-outline" size={16} color={colors.primary} />
            <Text style={[s.outlineBtnText, { color: colors.primary }]}>Татах</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.solidBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={showComingSoon}
          >
            <Text style={[s.solidBtnText, { color: colors.primaryText }]}>Эмчид хуваалцах</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, marginHorizontal: 16, padding: 16, gap: 14 },
  top: { flexDirection: 'row', gap: 14 },
  docPreview: { width: 72, height: 86, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, padding: 10, gap: 6, justifyContent: 'center' },
  docLine: { height: 4, borderRadius: 2 },
  docLineWide: { width: '80%' },
  docLineShort: { width: '50%' },
  docInfo: { flex: 1, gap: 4 },
  docTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  docMeta: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  btns: { flexDirection: 'row', gap: 10 },
  outlineBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 9999, borderWidth: 1.5 },
  outlineBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  solidBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 11, borderRadius: 9999 },
  solidBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
})

export default LatestReport
