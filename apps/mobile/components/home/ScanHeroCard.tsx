import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/ThemeContext'

type Props = { onScan: () => void }

const ScanHeroCard = ({ onScan }: Props) => {
  const { colors } = useTheme()

  return (
    <View style={[s.card, { backgroundColor: colors.primary }]}>
      <View style={s.textCol}>
        <Text style={[s.title, { color: colors.primaryText }]}>Амны хөндийн байдал</Text>
        <Text style={[s.sub, { color: colors.primaryText }]}>Асуумж ・ Үнэлгээ ・ Дүгнэлт</Text>
      </View>

      <TouchableOpacity
        style={[s.btn, { backgroundColor: colors.primaryText }]}
        onPress={onScan}
        activeOpacity={0.8}
      >
        <Ionicons name="camera-outline" size={18} color={colors.primary} />
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  textCol: { gap: 4 },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', opacity: 0.75 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  btnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
})

export default ScanHeroCard
