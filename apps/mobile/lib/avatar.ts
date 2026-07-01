import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { updateMe, type ProfileResult } from './api'

// Open the device photo gallery, let the user crop to a square, then downscale +
// compress the pick and persist it on the server as a base64 data URL (stored
// inline in the User row — no object storage). Returns null if the user cancels.
export const pickAndUploadAvatar = async (): Promise<ProfileResult | null> => {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!perm.granted) throw new Error('Зургийн санд хандах зөвшөөрөл өгнө үү')

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  })
  if (res.canceled || !res.assets?.length) return null

  // 256px JPEG @ 0.6 keeps the base64 payload small enough to store in the row.
  const ctx = ImageManipulator.manipulate(res.assets[0].uri)
  ctx.resize({ width: 256 })
  const ref = await ctx.renderAsync()
  const out = await ref.saveAsync({ compress: 0.6, format: SaveFormat.JPEG, base64: true })
  if (!out.base64) throw new Error('Зураг боловсруулж чадсангүй')

  return updateMe({ avatarUrl: `data:image/jpeg;base64,${out.base64}` })
}
