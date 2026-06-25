import { useState, useRef, useEffect } from 'react'
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { analyzeImages } from '@/lib/api'
import { toMongolian } from '@/lib/errorMessages'
import CameraPermission from '@/components/scan/camera/CameraPermission'
import CameraHintBanner from '@/components/scan/camera/CameraHintBanner'
import CameraFrameOverlay from '@/components/scan/camera/CameraFrameOverlay'
import CameraShutterBar from '@/components/scan/camera/CameraShutterBar'

type Photos = { upper?: string; lower?: string }

export default function CameraScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    childKey: string; classId: string; schoolId: string
    seasonId: string; questionnaire: string; guardianPhone: string
  }>()
  const [permission, requestPermission] = useCameraPermissions()
  const [analyzing, setAnalyzing] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'upper' | 'lower'>('upper')
  const [photos, setPhotos] = useState<Photos>({})
  const [cameraReady, setCameraReady] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  // Fallback: clear loading overlay after 1.5s if onCameraReady is slow
  useEffect(() => {
    const t = setTimeout(() => setCameraReady(true), 1500)
    return () => clearTimeout(t)
  }, [])

  if (!permission) return <View style={s.root} />
  if (!permission.granted) return <CameraPermission onRequest={requestPermission} />

  const compress = async (uri: string): Promise<string> => {
    const ctx = ImageManipulator.manipulate(uri)
    ctx.resize({ width: 640 })
    const ref = await ctx.renderAsync()
    const out = await ref.saveAsync({ compress: 0.8, format: SaveFormat.JPEG })
    return out.uri
  }

  const capture = async () => {
    if (!cameraRef.current || analyzing || capturing) return
    setError(null)
    setCapturing(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 })
      if (!photo) throw new Error('Зураг авах амжилтгүй')
      const uri = await compress(photo.uri)
      const newPhotos: Photos = { ...photos, [mode]: uri }
      setPhotos(newPhotos)

      if (!newPhotos.upper || !newPhotos.lower) {
        // Switch to the other mode for the second shot
        setMode(m => m === 'upper' ? 'lower' : 'upper')
        setCapturing(false)
        return
      }

      // Both photos captured — analyze
      setCapturing(false)
      setAnalyzing(true)
      const result = await analyzeImages(newPhotos.upper, newPhotos.lower, {
        childKey: params.childKey, classId: params.classId,
        schoolId: params.schoolId, seasonId: params.seasonId,
        questionnaire: params.questionnaire,
      })
      router.replace({
        pathname: '/scan/result',
        params: {
          screeningId: result.screeningId, triageLevel: result.triageLevel,
          triageScore: String(result.triageScore),
          detectionsCount: String(result.detections.length),
          guardianPhone: params.guardianPhone ?? '',
          childKey: params.childKey,
          classId: params.classId,
          schoolId: params.schoolId,
          seasonId: params.seasonId,
          questionnaire: params.questionnaire,
        },
      })
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err)
      console.error('[camera] failed:', raw)
      setError(toMongolian(err))
      setCapturing(false)
      setAnalyzing(false)
    }
  }

  const toggleMode = () => setMode(m => m === 'upper' ? 'lower' : 'upper')

  const busy = analyzing || capturing

  return (
    <View style={s.root}>
      <CameraView
        ref={cameraRef} style={s.camera} facing="back"
        enableTorch onCameraReady={() => setCameraReady(true)}
      />
      {!cameraReady && (
        <View style={s.camLoading}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.overlayText}>Камер бэлдэж байна...</Text>
        </View>
      )}
      <CameraFrameOverlay mode={mode} />
      <CameraHintBanner mode={mode} />

      {/* Step indicator */}
      <View style={s.stepRow}>
        <View style={[s.stepDot, photos.upper ? s.stepDone : s.stepPending]}>
          <Text style={s.stepTxt}>{photos.upper ? '✓' : '1'}</Text>
        </View>
        <View style={s.stepLine} />
        <View style={[s.stepDot, photos.lower ? s.stepDone : s.stepPending]}>
          <Text style={s.stepTxt}>{photos.lower ? '✓' : '2'}</Text>
        </View>
      </View>

      {(analyzing || capturing) && (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.overlayText}>
            {analyzing ? 'Шинжилж байна…' : 'Зураг боловсруулж байна…'}
          </Text>
        </View>
      )}
      {!!error && <Text style={s.errorBanner}>{error}</Text>}

      <View style={s.bottomBar}>
        <TouchableOpacity style={s.modeBtn} onPress={toggleMode} disabled={busy}>
          <Text style={s.modeTxt}>{mode === 'upper' ? '↓ Доод' : '↑ Дээд'}</Text>
        </TouchableOpacity>
        <CameraShutterBar onCapture={capture} disabled={busy} />
        <View style={{ width: 72 }} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  camLoading: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', gap: 12 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: 12 },
  overlayText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  errorBanner: { position: 'absolute', bottom: 130, left: 20, right: 20, backgroundColor: 'rgba(200,0,0,0.85)', color: '#fff', textAlign: 'center', padding: 12, borderRadius: 10, fontFamily: 'Inter_500Medium', fontSize: 13 },
  stepRow: { position: 'absolute', top: 160, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepPending: { backgroundColor: 'rgba(255,255,255,0.25)' },
  stepDone: { backgroundColor: '#22c55e' },
  stepTxt: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },
  stepLine: { width: 24, height: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  bottomBar: { position: 'absolute', bottom: 44, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 20 },
  modeBtn: { width: 72, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  modeTxt: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
})
