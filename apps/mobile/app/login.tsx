import { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/ThemeContext'
import AuthBrand from '@/components/auth/AuthBrand'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'

type Mode = 'login' | 'register'

const TABS: { mode: Mode; label: string }[] = [
  { mode: 'login', label: 'Нэвтрэх' },
  { mode: 'register', label: 'Бүртгүүлэх' },
]

const { height } = Dimensions.get('window')

// Auth as a bottom slide-over: brand backdrop with the form sheet sliding up.
const LoginScreen = () => {
  const { colors } = useTheme()
  const [mode, setMode] = useState<Mode>('login')
  const slide = useRef(new Animated.Value(height)).current

  useEffect(() => {
    Animated.timing(slide, { toValue: 0, duration: 320, useNativeDriver: true }).start()
  }, [slide])

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={s.brandWrap}>
        <AuthBrand subtitle={'Хүүхдийн шүдний эрүүл мэндийн\nанхан шатны хяналт'} />
      </SafeAreaView>

      <Animated.View style={[s.sheet, { backgroundColor: colors.surface, transform: [{ translateY: slide }] }]}>
        <View style={[s.grabber, { backgroundColor: colors.border }]} />
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[s.tabs, { backgroundColor: colors.surfaceRaised }]}>
            {TABS.map(({ mode: m, label }) => (
              <TouchableOpacity
                key={m}
                style={[s.tab, mode === m && { backgroundColor: colors.surface }]}
                onPress={() => setMode(m)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabLabel, { color: mode === m ? colors.textBase : colors.textMuted }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'login' ? <LoginForm /> : <RegisterForm />}
        </ScrollView>
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  brandWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 8 },
  scroll: { padding: 22, gap: 20, paddingBottom: 40 },
  tabs: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
})

export default LoginScreen
