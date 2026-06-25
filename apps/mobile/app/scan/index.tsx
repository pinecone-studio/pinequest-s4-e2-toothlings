import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { getUser, AuthUser } from '@/lib/auth'
import { useTheme } from '@/lib/ThemeContext'
import TeacherChildForm from '@/components/scan/info/TeacherChildForm'
import ParentChildForm from '@/components/scan/info/ParentChildForm'

const DIRECT_SEASON = '2026-spring'

export default function ScanEntryScreen() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { colors } = useTheme()

  useEffect(() => {
    getUser().then((u) => {
      setUser(u)
      setLoading(false)
      if (!u || (u.role !== 'teacher' && u.role !== 'parent')) {
        router.replace({
          pathname: '/scan/questionnaire' as never,
          params: {
            childKey: `direct:${u?.id ?? 'anon'}:${Date.now()}`,
            classId: 'direct',
            schoolId: 'direct',
            seasonId: DIRECT_SEASON,
            guardianPhone: '',
          },
        })
      }
    })
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  if (user?.role === 'teacher') return <TeacherChildForm />
  if (user?.role === 'parent') return <ParentChildForm userId={user.id} />
  return <View style={{ flex: 1, backgroundColor: colors.bg }} />
}
