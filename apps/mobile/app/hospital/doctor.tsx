import { View, Text, Image, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'
import BackButton from '@/components/BackButton'

const DoctorScreen = () => {
  const { colors } = useTheme()
  const { name, specialty, clinic, area, avatarUrl, phone } =
    useLocalSearchParams<{ id: string; name: string; specialty: string; clinic: string; area: string; avatarUrl: string; phone: string }>()

  const initials = (name ?? '?').split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2)
  const badges = [clinic, area].filter(Boolean)

  const call = () => { if (phone) void Linking.openURL(`tel:${phone}`) }
  const sms = () => { if (phone) void Linking.openURL(`sms:${phone}`) }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.bg }]}>
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <BackButton />
        <Text style={[s.headerTitle, { color: colors.textBase }]}>Эмчийн мэдээлэл</Text>
        <View style={s.placeholder} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback, { backgroundColor: colors.triageGreenBg }]}>
              <Text style={[s.avatarText, { color: colors.primary }]}>{initials}</Text>
            </View>
          )}
          <Text style={[s.name, { color: colors.textBase }]}>{name}</Text>
          {specialty ? <Text style={[s.specialty, { color: colors.textMuted }]}>{specialty}</Text> : null}
          {badges.length > 0 && (
            <View style={s.badges}>
              {badges.map((b) => (
                <View key={b} style={[s.badge, { backgroundColor: colors.surfaceRaised }]}>
                  <Text style={[s.badgeText, { color: colors.textSecondary }]}>{b}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.actions}>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={sms}
            activeOpacity={0.8}
            disabled={!phone}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
            <Text style={[s.btnText, { color: colors.textBase }]}>SMS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: colors.primary }]}
            onPress={call}
            activeOpacity={0.8}
            disabled={!phone}
          >
            <Ionicons name="call-outline" size={22} color={colors.primaryText} />
            <Text style={[s.btnText, { color: colors.primaryText }]}>Утасдах</Text>
          </TouchableOpacity>
        </View>

        {!phone && (
          <Text style={[s.noPhone, { color: colors.textMuted }]}>
            Энэ эмчийн утасны дугаар бүртгэгдээгүй байна.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
  placeholder: { width: 40 },
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 20, alignItems: 'center', gap: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 32 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  specialty: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 9999, borderWidth: StyleSheet.hairlineWidth },
  btnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  noPhone: { textAlign: 'center', fontSize: 13, fontFamily: 'Inter_400Regular' },
})

export default DoctorScreen
