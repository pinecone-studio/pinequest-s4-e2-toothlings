import { Alert, Linking } from 'react-native'
import { WEB_BASE } from './config'
import { createInvite } from './api'

// Video call = the web board's PeerJS/WebRTC call, reused as-is. Expo Go bundles no
// WebRTC (or expo-web-browser) native module, but the phone's own browser does — so
// we open the web `/call/{room}` page with core `Linking.openURL` (always available
// in Expo Go), and PeerJS runs there. See memory [[expo-go-native-modules]].

/** A fresh, PII-free room id — same shape the web caller generates. */
const newRoomId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const openRoom = (roomId: string, role: 'host' | 'guest', inviteId?: string): Promise<void> =>
  Linking.openURL(`${WEB_BASE}/call/${roomId}?as=${role}${inviteId ? `&inviteId=${inviteId}` : ''}`)

/**
 * Place a video call to the dentist: create a room, ring them (invite), then open
 * the room as host in the phone browser. The dentist, logged into the web board,
 * gets the incoming-call overlay, accepts, and joins the same room as guest.
 */
export const callDentist = async (dentistId: string, fromName: string): Promise<void> => {
  if (!dentistId) {
    Alert.alert('Дуудлага', 'Энэ цагт эмч хуваарилагдаагүй байна.')
    return
  }
  const roomId = newRoomId()
  // Ring the dentist FIRST — the invite is what makes the incoming-call overlay pop
  // up on their board. If it fails there is nobody to answer, so surface the error
  // instead of silently opening a room that will just time out.
  const invite = await createInvite(roomId, dentistId, fromName).catch(() => null)
  if (!invite?.id) {
    Alert.alert('Дуудлага', 'Эмчид дуудлага илгээж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.')
    return
  }
  await openRoom(roomId, 'host', invite.id)
}
