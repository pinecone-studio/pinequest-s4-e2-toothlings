import { Linking } from 'react-native'
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
export const callDentist = async (dentistUserId: string, fromName: string): Promise<void> => {
  const roomId = newRoomId()
  // Ring the dentist first so the overlay is up by the time we're in the room.
  // Best-effort: if the invite fails, still open the room.
  const invite = await createInvite(roomId, dentistUserId, fromName).catch(() => null)
  return openRoom(roomId, 'host', invite?.id)
}
