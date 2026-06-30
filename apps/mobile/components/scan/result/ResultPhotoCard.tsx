import { useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import type { PhotoAnalysis } from '@/lib/api'
import { findingLabel } from './findingLabels'

const ARCH_LABEL: Record<PhotoAnalysis['arch'], string> = {
  upper: 'Дээд эгнээ',
  lower: 'Доод эгнээ',
}

type Props = { photo: PhotoAnalysis }

export default function ResultPhotoCard({ photo }: Props) {
  const { colors } = useTheme()
  // Natural pixel size of the captured image. Box coords are pixels in this same
  // space (we display the exact file that was sent to inference), so we divide by it.
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    let active = true
    Image.getSize(
      photo.uri,
      (w, h) => { if (active && w > 0 && h > 0) setSize({ w, h }) },
      () => {/* without dimensions we skip the boxes */},
    )
    return () => { active = false }
  }, [photo.uri])

  const aspect = size ? size.w / size.h : 4 / 3

  const count = photo.detections.length

  return (
    <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={s.header}>
        <Text style={[s.archLabel, { color: colors.textBase }]}>{ARCH_LABEL[photo.arch]}</Text>
        <View style={[s.countBadge, { backgroundColor: count > 0 ? colors.triageYellowBg : colors.triageGreenBg }]}>
          <Text style={[s.countText, { color: count > 0 ? colors.triageYellowText : colors.triageGreenText }]}>
            {count > 0 ? `${count} илэрц` : '✓ Цэвэр'}
          </Text>
        </View>
      </View>

      <View style={[s.imageWrap, { aspectRatio: aspect, backgroundColor: colors.surfaceRaised }]}>
        <Image source={{ uri: photo.uri }} style={s.image} resizeMode="contain" />
        {size && photo.detections.map((d, i) => {
          const left = (d.box.x1 / size.w) * 100
          const top = (d.box.y1 / size.h) * 100
          const width = ((d.box.x2 - d.box.x1) / size.w) * 100
          const height = ((d.box.y2 - d.box.y1) / size.h) * 100
          return (
            <View
              key={i}
              style={[s.box, { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }]}
            >
              <View style={s.boxTag}>
                <Text style={s.boxTagText} numberOfLines={1}>
                  {findingLabel(d.className)} {Math.round(d.confidence * 100)}%
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 12, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  archLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  countBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  imageWrap: { width: '100%', borderRadius: 12, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%' },
  box: { position: 'absolute', borderWidth: 2, borderColor: '#F3B900', borderRadius: 6, backgroundColor: 'rgba(243,185,0,0.12)' },
  boxTag: { position: 'absolute', top: -20, left: 0, maxWidth: 160, backgroundColor: 'rgba(15,23,42,0.85)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  boxTagText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_500Medium' },
})
