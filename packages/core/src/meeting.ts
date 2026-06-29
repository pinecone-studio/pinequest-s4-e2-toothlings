// Pure helpers for the volunteer dentist video-call room.
//
// Safety: the room id is derived ONLY from the appointment's own UUID — never
// from a child's name, roster slot, or any PII. Jitsi Meet public rooms need no
// account or API key, so this stays infra-free and works from the phone directly.
const JITSI_BASE = 'https://meet.jit.si'

export const jitsiRoomName = (appointmentId: string): string => `screener-${appointmentId}`

export const jitsiRoomUrl = (appointmentId: string): string => `${JITSI_BASE}/${jitsiRoomName(appointmentId)}`
