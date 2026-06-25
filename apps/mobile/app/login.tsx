import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/ThemeContext'
import AuthBrand from '@/components/auth/AuthBrand'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import OrDivider from '@/components/auth/OrDivider'
import OutlineButton from '@/components/auth/OutlineButton'
import RoleChips from '@/components/auth/RoleChips'

type Mode = 'login' | 'register'

const LoginScreen = () => {
  const { colors } = useTheme()
  const [mode, setMode] = useState<Mode>('login')

  const subtitle = mode === 'login'
    ? 'Хүүхдийн шүдний эрүүл мэндийн\nанхан шатны шүүлт'
    : 'Шинэ бүртгэл үүсгэх'

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthBrand subtitle={subtitle} />

        <View style={[s.card, { backgroundColor: colors.surface }]}>
          {mode === 'login'
            ? <LoginForm />
            : <RegisterForm onBack={() => setMode('login')} />
          }
        </View>

        {mode === 'login' && (
          <>
            <OrDivider />
            <OutlineButton
              label="Шинээр бүртгүүлэх"
              onPress={() => setMode('register')}
            />
            <RoleChips />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: 24,
    gap: 20,
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
})

export default LoginScreen
