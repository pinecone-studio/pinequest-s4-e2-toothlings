import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { getUser, type AuthUser } from '@/lib/auth'
import { useOutboxSync } from '@/lib/useOutboxSync'
import GreetingHeader from '@/components/home/GreetingHeader'
import RoleSelector from '@/components/home/RoleSelector'
import ChildrenTabRow from '@/components/home/ChildrenTabRow'
import ScanHeroCard from '@/components/home/ScanHeroCard'
import LastScreeningCard from '@/components/home/LastScreeningCard'
import QuickActionGrid from '@/components/home/QuickActionGrid'

const MOCK_CHILDREN = [
  { id: '1', name: 'Болд' },
  { id: '2', name: 'Сарнай' },
  { id: '3', name: 'Энхбаяр' },
]

const QUICK_ACTIONS = [
  { id: 'history', icon: 'list-outline' as const,    label: 'Шалгалтын\nтүүх' },
  { id: 'guide',   icon: 'book-outline' as const,    label: 'Заавар' },
  { id: 'map',     icon: 'location-outline' as const, label: 'Ойрын\nэмнэлэг' },
  { id: 'share',   icon: 'share-outline' as const,   label: 'Хуваалцах' },
]

const HomeScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const { sync } = useOutboxSync()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [activeChild, setActiveChild] = useState(MOCK_CHILDREN[0].id)
  const [online, setOnline] = useState(true)

  useEffect(() => { getUser().then(setUser) }, [])
  useFocusEffect(useCallback(() => { void sync() }, [sync]))

  const handleScan = () => router.push('/scan')

  const actions = QUICK_ACTIONS.map((a) => ({
    ...a,
    onPress: () => {
      if (a.id === 'history') router.push('/(tabs)/history')
      else if (a.id === 'guide') router.push('/(tabs)/guide')
      else if (a.id === 'map') router.push('/(tabs)/hospital')
    },
  }))

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <GreetingHeader name={user?.name ?? '...'} online={online} />
        <RoleSelector role={user?.role ?? 'screener'} />
        <ChildrenTabRow
          children={MOCK_CHILDREN}
          activeId={activeChild}
          onSelect={setActiveChild}
        />
        <ScanHeroCard onScan={handleScan} />
        <LastScreeningCard
          date="2026-06-20"
          triageLevel="green"
          summary="Аюулын шинж тэмдэг олдсонгүй — шүдний эмчид хянуулахыг зөвлөж байна"
          onPress={() => router.push('/(tabs)/history')}
        />
        <QuickActionGrid actions={actions} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 18, paddingBottom: 32 },
})

export default HomeScreen
