import { useState, useEffect, useRef } from 'react'
import { View, Animated, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native'
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
  const [showTransition, setShowTransition] = useState(false)
  const transitionOpacity = useRef(new Animated.Value(0)).current

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

  // Show mode-transition interstitial after upper photo is captured
  const prevUpperRef = useRef(false)
  useEffect(() => {
    if (!prevUpperRef.current && !!photos.upper && !photos.lower) {
      setShowTransition(true)
      transitionOpacity.setValue(1)
      const t = setTimeout(() => {
        Animated.timing(transitionOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
          setShowTransition(false)
          toggleMode()
        })
      }, 1400)
      return () => clearTimeout(t)
    }
    prevUpperRef.current = !!photos.upper
  }, [photos.upper, photos.lower, transitionOpacity, toggleMode])

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

      {/* Labeled step pills: Дээд / Доод */}
      <View style={s.stepRow}>
        <View style={[ts.stepPill, photos.upper ? ts.pillDone : mode === 'upper' ? ts.pillActive : ts.pillPending]}>
          <Text style={ts.pillTxt}>{photos.upper ? '✓ Дээд' : 'Дээд'}</Text>
        </View>
        <View style={s.stepLine} />
        <View style={[ts.stepPill, photos.lower ? ts.pillDone : mode === 'lower' ? ts.pillActive : ts.pillPending]}>
          <Text style={ts.pillTxt}>{photos.lower ? '✓ Доод' : 'Доод'}</Text>
        </View>
      </View>

      {busy && (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.overlayText}>{analyzing ? 'Уншиж байна...' : 'Дүгнэлтийг гаргаж байна...'}</Text>
        </View>
      )}

      {showTransition && (
        <Animated.View style={[ts.interstitial, { opacity: transitionOpacity }]}>
          <Text style={ts.interstitialIcon}>🦷</Text>
          <Text style={ts.interstitialText}>Одоо доод шүдийг авна уу</Text>
        </Animated.View>
      )}

      {!!error && <Text style={s.errorBanner}>{error}</Text>}

      <View style={s.bottomBar}>
        <TouchableOpacity style={s.modeBtn} onPress={toggleMode} disabled={busy}>
          <Ionicons name="sync-outline" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <CameraShutterBar onCapture={capture} disabled={busy} />
        <TouchableOpacity style={s.modeBtn} onPress={() => setTorchOn(v => !v)} disabled={busy}>
          <Ionicons name={torchOn ? 'flashlight' : 'flashlight-outline'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const ts = StyleSheet.create({
  stepPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, minWidth: 64, alignItems: 'center' },
  pillActive: { backgroundColor: 'rgba(255,200,0,0.85)' },
  pillDone: { backgroundColor: '#22c55e' },
  pillPending: { backgroundColor: 'rgba(255,255,255,0.2)' },
  pillTxt: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  interstitial: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  interstitialIcon: { fontSize: 56 },
  interstitialText: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold', textAlign: 'center', paddingHorizontal: 32 },
})
