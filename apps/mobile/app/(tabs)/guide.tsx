import { Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import GuideTabs, { GuideTab } from '@/components/guide/GuideTabs'
import BrushingGuide from '@/components/guide/BrushingGuide'
import ComingSoon from '@/components/guide/ComingSoon'

export default function GuideScreen() {
  const { colors } = useTheme()
  const [tab, setTab] = useState<GuideTab>('guide')

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <Text style={[s.pageTitle, { color: colors.textBase }]}>Заавар</Text>
      <GuideTabs active={tab} onChange={setTab} />
      {tab === 'guide' ? <BrushingGuide /> : <ComingSoon />}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  pageTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
})
