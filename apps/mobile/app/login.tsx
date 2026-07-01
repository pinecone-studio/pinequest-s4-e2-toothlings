import { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View, Text, TouchableOpacity } from 'react-native'
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

const TAB_PAD = 4

// Auth as a bottom slide-over: brand backdrop with the form sheet sliding up.
const LoginScreen = () => {
  const { colors } = useTheme()
  const [mode, setMode] = useState<Mode>('login')
  const [tabsW, setTabsW] = useState(0)
  const slide = useRef(new Animated.Value(height)).current
  // 0 = login (left), 1 = register (right) — drives the sliding pill.
  const pill = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(slide, { toValue: 0, duration: 320, useNativeDriver: true }).start()
  }, [slide])

  useEffect(() => {
    Animated.spring(pill, {
      toValue: mode === 'login' ? 0 : 1,
      useNativeDriver: true,
      friction: 9,
      tension: 90,
    }).start()
  }, [mode, pill])

  const pillW = tabsW ? (tabsW - TAB_PAD * 2) / TABS.length : 0
  const pillX = pill.interpolate({ inputRange: [0, 1], outputRange: [0, pillW] })

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={s.brandWrap}>
          <AuthBrand subtitle={'Хүүхдийн амны хөндийн хяналт ба чиглүүлэг'} />
        </SafeAreaView>
      </TouchableWithoutFeedback>

      <Animated.View style={[s.sheet, { backgroundColor: colors.surface, transform: [{ translateY: slide }] }]}>
        <View style={[s.grabber, { backgroundColor: colors.border }]} />
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[s.tabs, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}
            onLayout={(e) => setTabsW(e.nativeEvent.layout.width)}
          >
            {pillW > 0 && (
              <Animated.View
                style={[
                  s.pill,
                  { width: pillW, backgroundColor: colors.primary, transform: [{ translateX: pillX }] },
                ]}
              />
            )}
            {TABS.map(({ mode: m, label }) => (
              <TouchableOpacity
                key={m}
                style={s.tab}
                onPress={() => setMode(m)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    s.tabLabel,
                    { color: mode === m ? colors.primaryText : colors.textMuted },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'login' ? <LoginForm /> : <RegisterForm />}
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
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
  tabs: { flexDirection: 'row', borderRadius: 9999, padding: TAB_PAD, borderWidth: StyleSheet.hairlineWidth, position: 'relative' },
  pill: {
    position: 'absolute',
    top: TAB_PAD,
    left: TAB_PAD,
    bottom: TAB_PAD,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
})

export default LoginScreen
