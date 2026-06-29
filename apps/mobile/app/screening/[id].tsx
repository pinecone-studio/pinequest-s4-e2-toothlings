import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import * as Print from 'expo-print'
import { seasonLabelMn } from '@pinequest/core'
import { useTheme } from '@/lib/ThemeContext'
import { getScreening, type ScreeningDetail } from '@/lib/api'
import { toMongolian } from '@/lib/errorMessages'
import ScreenHeader from '@/components/teacher/ScreenHeader'

const LEVEL_LABEL: Record<string, string> = {
  green: 'Харьцангуй эрүүл',
  yellow: 'Эмчилгээ шаардлагатай',
  red: 'Яаралтай эмчилгээ шаардлагатай',
}

const FINDING_LABEL: Record<string, string> = {
  caries: 'Шүд цоорол',
  cavity: 'Гүн цоорол (цоорхой)',
  crack: 'Шүдний хагарал',
}

const findingLabel = (cls: string): string => FINDING_LABEL[cls.toLowerCase()] ?? cls

const SYMPTOM_LABEL: Record<string, string> = {
  swelling: 'Хавдалт',
  painDisturbingSleepOrEating: 'Нойр/хооллолтод саад болох өвдөлт',
  fever: 'Халууралт',
  gumPimpleOrFistula: 'Буйлны цэр / фистул',
  trauma: 'Гэмтэл',
  bleedingGums: 'Буйл цус гарах',
}

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const activeSymptoms = (q: ScreeningDetail['questionnaire']): string[] =>
  q
    ? Object.entries(SYMPTOM_LABEL)
        .filter(([k]) => (q as Record<string, boolean | null>)[k])
        .map(([, v]) => v)
    : []

const buildHtml = (d: ScreeningDetail): string => {
  const name = d.childName || 'Нэр тодорхойгүй'
  const level = LEVEL_LABEL[d.triageLevel] ?? d.triageLevel
  const levelColor =
    d.triageLevel === 'green' ? '#3B8C5E' : d.triageLevel === 'red' ? '#A84545' : '#A8580A'
  const symptoms = activeSymptoms(d.questionnaire)
  const findingsRows = d.findings.length
    ? d.findings
        .map(
          (f) =>
            `<tr><td>${f.fdi ?? '—'}</td><td>${findingLabel(f.className)}</td><td>${Math.round(f.confidence * 100)}%</td></tr>`,
        )
        .join('')
    : `<tr><td colspan="3" style="color:#888">Илрэл бүртгэгдээгүй</td></tr>`
  const symptomsHtml = symptoms.length
    ? `<ul>${symptoms.map((s) => `<li>${s}</li>`).join('')}</ul>`
    : '<p style="color:#888">Шинж тэмдэг бүртгэгдээгүй</p>'
  const reviewHtml = d.review
    ? `<div class="box"><div class="label">Шүдний эмчийн баталгаажуулалт</div><p><b>${LEVEL_LABEL[d.review.confirmedLevel] ?? d.review.confirmedLevel}</b></p>${d.review.note ? `<p>${d.review.note}</p>` : ''}</div>`
    : ''
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#1c1c1e;padding:32px;font-size:13px}
    h1{font-size:20px;margin:0 0 2px}
    .sub{color:#666;margin:0 0 20px}
    .pill{display:inline-block;background:${levelColor};color:#fff;padding:6px 14px;border-radius:20px;font-weight:700;font-size:14px}
    .grid{display:flex;flex-wrap:wrap;gap:6px 32px;margin:18px 0}
    .grid div{min-width:140px}
    .label{font-size:11px;letter-spacing:.5px;color:#888;text-transform:uppercase;margin-bottom:2px}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #eee}
    th{font-size:11px;color:#888;text-transform:uppercase}
    .box{border:1px solid #eee;border-radius:10px;padding:14px;margin-top:16px}
    .section{font-size:14px;font-weight:700;margin:22px 0 4px}
    .foot{margin-top:28px;color:#999;font-size:11px;line-height:1.5;border-top:1px solid #eee;padding-top:12px}
    ul{margin:6px 0;padding-left:18px}
  </style></head><body>
    <h1>Шүдний скрининг — тайлан</h1>
    <p class="sub">Урьдчилсан чиглүүлэг (онош биш). Шүдний эмч эцэслэн батална.</p>
    <span class="pill">${level}</span>
    <div class="grid">
      <div><div class="label">Сурагч</div>${name}</div>
      <div><div class="label">Төрсөн он</div>${d.childBirthYear ?? '—'}</div>
      <div><div class="label">Огноо</div>${fmtDate(d.capturedAt)}</div>
      <div><div class="label">Улирал</div>${seasonLabelMn(d.seasonId)}</div>
    </div>
    <div class="section">Илэрсэн зүйлс</div>
    <table><thead><tr><th>Шүд (FDI)</th><th>Төрөл</th><th>Магадлал</th></tr></thead><tbody>${findingsRows}</tbody></table>
    <div class="section">Асуумжийн шинж тэмдэг</div>
    ${symptomsHtml}
    ${reviewHtml}
    <div class="foot">Энэ тайлан нь утсан камераар хийсэн урьдчилсан скринингийн дүн бөгөөд оношилгоо биш. Ногоон = эдгээр зурагт аюулын шинж ажиглагдаагүй. Эцсийн дүгнэлтийг шүдний эмч өгнө.</div>
  </body></html>`
}

export default function ScreeningDetailScreen() {
  const { colors } = useTheme()
  const { id, childName, level } = useLocalSearchParams<{
    id: string
    childName?: string
    level?: string
  }>()
  const [detail, setDetail] = useState<ScreeningDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    getScreening(id)
      .then(setDetail)
      .catch((e: unknown) => setError(toMongolian(e)))
  }, [id])

  const onShare = async () => {
    if (!detail) return
    setSharing(true)
    try {
      await Print.printAsync({ html: buildHtml(detail) })
    } catch {
      // user cancelled or print unavailable — no-op
    } finally {
      setSharing(false)
    }
  }

  const shownLevel = detail?.triageLevel ?? level ?? 'green'
  const shownName = detail?.childName || childName || 'Нэр тодорхойгүй'
  const levelColor =
    shownLevel === 'green'
      ? colors.triageGreenText
      : shownLevel === 'red'
        ? colors.triageRedText
        : colors.triageYellowText
  const badgeBg =
    shownLevel === 'green'
      ? colors.badgeGreen
      : shownLevel === 'red'
        ? colors.badgeRed
        : colors.badgeYellow

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[s.safe, { backgroundColor: colors.bg }]}>
      <View style={s.head}>
        <ScreenHeader title="Дүгнэлт тайлан" subtitle={shownName} />
      </View>

      {!detail && !error ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={[s.muted, { color: colors.textMuted }]}>{error}</Text>
        </View>
      ) : detail ? (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Document "page" */}
          <View style={[s.page, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.docTitle, { color: colors.textBase }]}>Шүдний дүгнэлт - тайлан</Text>
            <Text style={[s.docSub, { color: colors.textMuted }]}>
              Урьдчилсан чиглүүлэг (онош биш). Шүдний эмч эцэслэн батална.
            </Text>

            <View style={[s.pill, { backgroundColor: badgeBg }]}>
              <Text style={s.pillText}>{LEVEL_LABEL[shownLevel] ?? shownLevel}</Text>
            </View>

            <View style={s.grid}>
              <Field label="Сурагч" value={shownName} colors={colors} />
              <Field
                label="Төрсөн он"
                value={detail.childBirthYear ? String(detail.childBirthYear) : '—'}
                colors={colors}
              />
              <Field label="Огноо" value={fmtDate(detail.capturedAt)} colors={colors} />
              <Field label="Улирал" value={seasonLabelMn(detail.seasonId)} colors={colors} />
            </View>

            <Text style={[s.section, { color: colors.textBase }]}>Илэрсэн зүйлс</Text>
            <View style={[s.tableHead, { borderColor: colors.border }]}>
              <Text style={[s.th, s.col1, { color: colors.textMuted }]}>Шүд (FDI)</Text>
              <Text style={[s.th, s.col2, { color: colors.textMuted }]}>Төрөл</Text>
              <Text style={[s.th, s.col3, { color: colors.textMuted }]}>Магадлал</Text>
            </View>
            {detail.findings.length ? (
              detail.findings.map((f) => (
                <View key={f.id} style={[s.tr, { borderColor: colors.border }]}>
                  <Text style={[s.td, s.col1, { color: colors.textBase }]}>{f.fdi ?? '—'}</Text>
                  <Text style={[s.td, s.col2, { color: colors.textBase }]}>{findingLabel(f.className)}</Text>
                  <Text style={[s.td, s.col3, { color: levelColor }]}>
                    {Math.round(f.confidence * 100)}%
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[s.muted, { color: colors.textMuted, paddingVertical: 8 }]}>
                Илрэл бүртгэгдээгүй
              </Text>
            )}

            <Text style={[s.section, { color: colors.textBase }]}>Асуумжийн шинж тэмдэг</Text>
            {activeSymptoms(detail.questionnaire).length ? (
              activeSymptoms(detail.questionnaire).map((sym) => (
                <View key={sym} style={s.symRow}>
                  <Ionicons name="ellipse" size={6} color={colors.textMuted} />
                  <Text style={[s.symText, { color: colors.textBase }]}>{sym}</Text>
                </View>
              ))
            ) : (
              <Text style={[s.muted, { color: colors.textMuted, paddingVertical: 4 }]}>
                Шинж тэмдэг бүртгэгдээгүй
              </Text>
            )}

            {detail.review ? (
              <View style={[s.reviewBox, { borderColor: colors.border }]}>
                <Text style={[s.label, { color: colors.textMuted }]}>
                  ШҮДНИЙ ЭМЧИЙН БАТАЛГААЖУУЛАЛТ
                </Text>
                <Text style={[s.reviewLevel, { color: colors.textBase }]}>
                  {LEVEL_LABEL[detail.review.confirmedLevel] ?? detail.review.confirmedLevel}
                </Text>
                {detail.review.note ? (
                  <Text style={[s.reviewNote, { color: colors.textBase }]}>
                    {detail.review.note}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <Text style={[s.foot, { color: colors.textDisabled, borderColor: colors.border }]}>
              Асуумж болон зурагт үндэслэсэн дүгнэлт нь шүд цоорох өвчний үндсэн онoш биш бөгөөд,
              өвчний үндсэн онoш биш болно.
            </Text>
          </View>
        </ScrollView>
      ) : null}

      {detail ? (
        <TouchableOpacity
          style={[s.shareBtn, { backgroundColor: colors.primary }]}
          onPress={onShare}
          disabled={sharing}
          activeOpacity={0.85}
        >
          {sharing ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <>
              <Ionicons name="share-outline" size={18} color={colors.primaryText} />
              <Text style={[s.shareText, { color: colors.primaryText }]}>
                PDF болгож хадгалах / хуваалцах
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </SafeAreaView>
  )
}

const Field = ({
  label,
  value,
  colors,
}: {
  label: string
  value: string
  colors: { textMuted: string; textBase: string }
}) => (
  <View style={s.field}>
    <Text style={[s.label, { color: colors.textMuted }]}>{label}</Text>
    <Text style={[s.fieldValue, { color: colors.textBase }]}>{value}</Text>
  </View>
)

const s = StyleSheet.create({
  safe: { flex: 1 },
  head: { paddingHorizontal: 20, paddingTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  scroll: { padding: 16, paddingBottom: 24 },
  page: { borderRadius: 16, borderWidth: 1, padding: 20 },
  docTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  docSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4, lineHeight: 18 },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 16,
  },
  pillText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12, columnGap: 24, marginTop: 18 },
  field: { minWidth: 120 },
  label: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 },
  fieldValue: { fontSize: 14, fontFamily: 'Inter_500Medium', marginTop: 2 },
  section: { fontSize: 14, fontFamily: 'Inter_700Bold', marginTop: 22, marginBottom: 6 },
  tableHead: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 6 },
  th: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.4 },
  tr: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 9 },
  td: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  col1: { width: 80 },
  col2: { flex: 1 },
  col3: { width: 80, textAlign: 'right' },
  symRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  symText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  reviewBox: { borderWidth: 1, borderRadius: 10, padding: 14, marginTop: 18, gap: 4 },
  reviewLevel: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  reviewNote: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  foot: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 17,
    marginTop: 24,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  muted: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    marginTop: 4,
    borderRadius: 14,
    padding: 16,
  },
  shareText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
})
