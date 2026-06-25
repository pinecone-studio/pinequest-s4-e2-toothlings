import { useState, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { analyzeImage } from '@/lib/api'
import { useTheme } from '@/lib/ThemeContext'
import { toMongolian } from '@/lib/errorMessages'

export default function CameraScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const params = useLocalSearchParams<{ childKey: string; classId: string; schoolId: string; seasonId: string; questionnaire: string; guardianPhone: string }>()
  const [permission, requestPermission] = useCameraPermissions()
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cameraRef = useRef<CameraView>(null)

  if (!permission) return <View style={s.root} />

  if (!permission.granted) {
    return (
      <View style={[s.center, { backgroundColor: colors.bg }]}>
        <Text style={[s.permText, { color: colors.textBase }]}>Камерын зөвшөөрөл шаардлагатай</Text>
        <TouchableOpacity style={[s.permBtn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={s.permBtnText}>Зөвшөөрөл өгөх</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const capture = async () => {
    if (!cameraRef.current || analyzing) return
    setError(null)
    setAnalyzing(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 })
      if (!photo) throw new Error('Зураг авах амжилтгүй')
      const compressed = await manipulateAsync(photo.uri, [{ resize: { width: 640 } }], { compress: 0.8, format: SaveFormat.JPEG })
      const result = await analyzeImage(compressed.uri, { childKey: params.childKey, classId: params.classId, schoolId: params.schoolId, seasonId: params.seasonId, questionnaire: params.questionnaire })
      router.replace({ pathname: '/scan/result', params: { screeningId: result.screeningId, triageLevel: result.triageLevel, triageScore: String(result.triageScore), detectionsCount: String(result.detections.length), guardianPhone: params.guardianPhone ?? '' } })
    } catch (err) {
      setError(toMongolian(err))
      setAnalyzing(false)
    }
  }

  return (
    <View style={s.root}>
      <CameraView ref={cameraRef} style={s.camera} facing="back" />
      {analyzing ? (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.overlayText}>Шинжилж байна…</Text>
        </View>
      ) : null}
      {error ? <Text style={s.errorBanner}>{error}</Text> : null}
      <View style={s.controls}>
        <TouchableOpacity style={s.captureBtn} onPress={capture} disabled={analyzing}>
          <View style={s.captureBtnInner} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Camera screen stays fully dark — contextually fixed, not themed.
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permText: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
  permBtn: { borderRadius: 10, padding: 14, paddingHorizontal: 24 },
  permBtnText: { color: '#fff', fontWeight: '600' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', gap: 12 },
  overlayText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorBanner: { position: 'absolute', bottom: 120, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', color: '#fecaca', textAlign: 'center', padding: 10, borderRadius: 8 },
  controls: { position: 'absolute', bottom: 44, left: 0, right: 0, alignItems: 'center' },
  captureBtn: { width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  captureBtnInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
})
