import { View, TouchableOpacity, StyleSheet } from 'react-native'

type Props = { onCapture: () => void; disabled: boolean }

export default function CameraShutterBar({ onCapture, disabled }: Props) {
  return (
    <TouchableOpacity
      style={[s.shutter, disabled && s.shutterDisabled]}
      onPress={onCapture}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={s.inner} />
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  shutter: {
    width: 74, height: 74, borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  shutterDisabled: { opacity: 0.35 },
  inner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
})
