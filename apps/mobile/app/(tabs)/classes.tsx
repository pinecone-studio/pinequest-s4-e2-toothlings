import { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import { useTheme } from '@/lib/ThemeContext'
import { useFloatingTabBarPad } from '@/lib/tabBarLayout'
import { getMyClasses, type TeacherClass } from '@/lib/api'
import { toMongolian } from '@/lib/errorMessages'
import ClassCard from '@/components/teacher/ClassCard'

const ClassesScreen = () => {
  const { colors } = useTheme()
  const tabBarPad = useFloatingTabBarPad()
  const router = useRouter()
  const [classes, setClasses] = useState<TeacherClass[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback((silent = false) => {
    if (!silent) setError(null)
    return getMyClasses()
      .then(setClasses)
      .catch((err) => setError(toMongolian(err)))
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
      return () => {}
    }, [load]),
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    load(true).finally(() => setRefreshing(false))
  }, [load])

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[s.safe, { backgroundColor: colors.bg }]}>
      <View style={s.head}>
        <Text style={[s.title, { color: colors.textBase }]}>Анги</Text>
        <TouchableOpacity
          style={[s.add, { backgroundColor: colors.primary }]}
          // A teacher already owns their class (created at signup) — jump straight
          // to adding students there, never a blank "new class" form. Only fall
          // back to class creation when they genuinely have none yet.
          onPress={() => {
            const own = classes?.[0]
            if (own) router.push({ pathname: '/class/[id]', params: { id: own.id, add: '1' } })
            else router.push('/class/new')
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      {classes === null && !error ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={[s.muted, { color: colors.textMuted }]}>{error}</Text>
        </View>
      ) : classes && classes.length === 0 ? (
        <View style={s.center}>
          <Ionicons name="school-outline" size={40} color={colors.textDisabled} />
          <Text style={[s.muted, { color: colors.textMuted }]}>
            Анги бүртгээгүй байна.{'\n'}“+” дарж эхний ангиа нэмнэ үү.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[s.list, { paddingBottom: tabBarPad }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {classes?.map((k) => (
            <ClassCard
              key={k.id}
              klass={k}
              onPress={() => router.push(`/class/${k.id}` as never)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.4 },
  add: { width: 42, height: 42, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 30 },
  muted: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 21 },
})

export default ClassesScreen
