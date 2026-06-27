import { useState, useEffect } from 'react'
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { isModelCached, downloadModel } from '@/lib/localInference'
import { useCameraCapture } from '@/lib/useCameraCapture'
import { usePriorLevel } from '@/lib/usePriorLevel'
import { useHistoryPrefetch } from '@/lib/useHistoryPrefetch'
import CameraPermission from '@/components/scan/camera/CameraPermission'
import CameraHintBanner from '@/components/scan/camera/CameraHintBanner'
import CameraFrameOverlay from '@/components/scan/camera/CameraFrameOverlay'
import CameraShutterBar from '@/components/scan/camera/CameraShutterBar'
import { PriorLevelBanner } from '@/components/scan/camera/PriorLevelBanner'
import { s } from './cameraStyles'

export default function CameraScreen() {
  const params = useLocalSearchParams<{
    childKey: string; classId: string; schoolId: string
    seasonId: string; questionnaire: string; guardianPhone: string; birthYear?: string
  }>()
  const [permission, requestPermission] = useCameraPermissions()
  const [cameraReady, setCameraReady] = useState(false)
  const [torchOn, setTorchOn] = useState(false)

  const { cameraRef, mode, photos, analyzing, capturing, error, capture, toggleMode } = useCameraCapture(params)
  const priorLevel = usePriorLevel(params.childKey)
  useHistoryPrefetch(params.classId, params.seasonId)

  useEffect(() => {
    const t = setTimeout(() => setCameraReady(true), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const modelUrl = process.env.EXPO_PUBLIC_MODEL_URL
    if (!modelUrl) return
    isModelCached().then((cached) => {
      if (!cached) downloadModel(modelUrl).catch(() => {})
    })
  }, [])

  if (!permission) return <View style={s.root} />
  if (!permission.granted) return <CameraPermission onRequest={requestPermission} />

  const busy = analyzing || capturing

  return (
    <View style={s.root}>
      <CameraView ref={cameraRef} style={s.camera} facing="back" enableTorch={torchOn} onCameraReady={() => setCameraReady(true)} />
      {!cameraReady && (
        <View style={s.camLoading}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.overlayText}>Уншиж байна...</Text>
        </View>
      )}
      <CameraFrameOverlay mode={mode} />
      <CameraHintBanner mode={mode} />
      {priorLevel && <PriorLevelBanner level={priorLevel} />}

      <View style={s.stepRow}>
        <View style={[s.stepDot, photos.upper ? s.stepDone : s.stepPending]}>
          <Text style={s.stepTxt}>{photos.upper ? '✓' : '1'}</Text>
        </View>
        <View style={s.stepLine} />
        <View style={[s.stepDot, photos.lower ? s.stepDone : s.stepPending]}>
          <Text style={s.stepTxt}>{photos.lower ? '✓' : '2'}</Text>
        </View>
      </View>

      {busy && (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.overlayText}>{analyzing ? 'Уншиж байна...' : 'Дүгнэлтийг гаргаж байна...'}</Text>
        </View>
      )}
      {!!error && <Text style={s.errorBanner}>{error}</Text>}

      <View style={s.bottomBar}>
        <TouchableOpacity style={s.modeBtn} onPress={toggleMode} disabled={busy}>
          <Text style={s.modeTxt}>{mode === 'upper' ? 'Эрүү' : 'Хоншоор'}</Text>
        </TouchableOpacity>
        <CameraShutterBar onCapture={capture} disabled={busy} />
        <TouchableOpacity style={s.modeBtn} onPress={() => setTorchOn(v => !v)} disabled={busy}>
          <Ionicons name={torchOn ? 'flashlight' : 'flashlight-outline'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}
