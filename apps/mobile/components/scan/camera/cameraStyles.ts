import { StyleSheet } from 'react-native'

export const s = StyleSheet.create({
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
  modeBtn: { width: 72, height: 48, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  modeTxt: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
})
