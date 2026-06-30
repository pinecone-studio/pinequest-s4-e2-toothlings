import { useState, useEffect, useRef } from 'react'
import { View, Animated, ActivityIndicator, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { QUADRANTS, QUADRANT_LABEL_MN, isUpperQuadrant } from '@pinequest/core'
import { isModelCached, downloadModel } from '@/lib/localInference'
import { useCameraCapture } from '@/lib/useCameraCapture'
import { usePriorLevel } from '@/lib/usePriorLevel'
import { useHistoryPrefetch } from '@/lib/useHistoryPrefetch'
import CameraPermission from '@/components/scan/camera/CameraPermission'
import CameraHintBanner from '@/components/scan/camera/CameraHintBanner'
import CameraFrameOverlay from '@/components/scan/camera/CameraFrameOverlay'
import CameraShutterBar from '@/components/scan/camera/CameraShutterBar'
import { PriorLevelBanner } from '@/components/scan/camera/PriorLevelBanner'
import { s } from '@/components/scan/camera/cameraStyles'

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

  const { cameraRef, mode, photos, analyzing, capturing, error, capture, retry, toggleMode } = useCameraCapture(params)
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

  const photoCount = QUADRANTS.filter(q => photos[q]).length

  // Show a region-transition interstitial each time a photo is captured and there
  // is still a next region to shoot. The capture hook already advances `mode` to
  // the next pending region, so this is a purely visual cue: it must NOT change
  // mode, and must record the new count before returning so it fires exactly once
  // per capture.
  const prevCountRef = useRef(0)
  useEffect(() => {
    if (photoCount > prevCountRef.current && photoCount < QUADRANTS.length) {
      prevCountRef.current = photoCount
      setShowTransition(true)
      transitionOpacity.setValue(1)
      const t = setTimeout(() => {
        Animated.timing(transitionOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
          setShowTransition(false)
        })
      }, 1400)
      return () => clearTimeout(t)
    }
    prevCountRef.current = photoCount
  }, [photoCount, transitionOpacity])

  if (!permission) return <View style={s.root} />
  if (!permission.granted) return <CameraPermission onRequest={requestPermission} />

  const busy = analyzing || capturing

  // While analyzing, show ONLY the loading screen — drop the live camera
  // capture surface behind it. Capturing a photo no longer shows this screen.
  if (analyzing) {
    return (
      <View style={s.root}>
        <View style={s.camLoading}>
          {/* eslint-disable-next-line @typescript-eslint/no-require-imports */}
          <Image source={require('@/assets/logoYellow.png')} style={ts.loadingLogo} resizeMode="contain" />
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.overlayText}>Дүгнэлтийг боловсруулж байна</Text>
        </View>
      </View>
    )
  }

  // Analysis failed after all four photos were captured — show a retry button that
  // re-runs the model on the already-captured photos.
  if (error && photoCount === QUADRANTS.length) {
    return (
      <View style={s.root}>
        <View style={s.camLoading}>
          <Ionicons name="alert-circle-outline" size={48} color="#fff" />
          <Text style={s.overlayText}>{error}</Text>
          <TouchableOpacity style={ts.retryBtn} onPress={retry}>
            <Ionicons name="refresh" size={18} color="#000" />
            <Text style={ts.retryTxt}>Дахин оролдох</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={s.root}>
      <CameraView ref={cameraRef} style={s.camera} facing="back" enableTorch={torchOn} onCameraReady={() => setCameraReady(true)} />
      {!cameraReady && (
        <View style={s.camLoading}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.overlayText}>Уншиж байна...</Text>
        </View>
      )}
      <CameraFrameOverlay mode={isUpperQuadrant(mode) ? 'upper' : 'lower'} />
      <CameraHintBanner quadrant={mode} />
      {priorLevel && <PriorLevelBanner level={priorLevel} />}

      {/* Labeled step pills for the four regions */}
      <View style={s.stepRow}>
        {QUADRANTS.map(q => (
          <View
            key={q}
            style={[ts.stepPill, photos[q] ? ts.pillDone : mode === q ? ts.pillActive : ts.pillPending]}
          >
            <Text style={ts.pillTxt}>{photos[q] ? `✓ ${PILL_LABEL[q]}` : PILL_LABEL[q]}</Text>
          </View>
        ))}
      </View>

      {showTransition && (
        <Animated.View style={[ts.interstitial, { opacity: transitionOpacity }]}>
          <Text style={ts.interstitialIcon}>🦷</Text>
          <Text style={ts.interstitialText}>Одоо «{QUADRANT_LABEL_MN[mode]}» хэсгийг авна уу</Text>
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

// Short labels for the compact step pills (full names live in the hint banner).
const PILL_LABEL: Record<(typeof QUADRANTS)[number], string> = {
  upperRight: 'Дээд Б',
  upperLeft: 'Дээд З',
  lowerRight: 'Доод Б',
  lowerLeft: 'Доод З',
}

const ts = StyleSheet.create({
  stepPill: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 14, minWidth: 52, alignItems: 'center' },
  pillActive: { backgroundColor: 'rgba(255,200,0,0.85)' },
  pillDone: { backgroundColor: '#22c55e' },
  pillPending: { backgroundColor: 'rgba(255,255,255,0.2)' },
  pillTxt: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  interstitial: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  interstitialIcon: { fontSize: 56 },
  interstitialText: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold', textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
    backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999,
  },
  retryTxt: { color: '#000', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  loadingLogo: { width: 140, height: 56, marginBottom: 12 },
})
