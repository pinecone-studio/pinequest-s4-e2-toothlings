import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID())
const ts = (name: string) => integer(name, { mode: 'timestamp_ms' })

// A 1-to-1 video-call INVITE (ringing notification only). The WebRTC media handshake
// goes peer-to-peer via PeerJS; this row just lets the callee know a call is coming.
// Short-lived: expiresAt = createdAt + 120s. Mutable status is the only mutable field.
export const callInvites = sqliteTable('CallInvite', {
  id: id(),
  roomId: text('roomId').notNull(),
  fromUserId: text('fromUserId').notNull(),
  fromName: text('fromName').notNull(),
  toUserId: text('toUserId').notNull(),
  status: text('status').notNull().default('ringing'), // 'ringing' | 'answered' | 'declined'
  createdAt: ts('createdAt').notNull().$defaultFn(() => new Date()),
  expiresAt: ts('expiresAt').notNull(),
}, (t) => [
  index('CallInvite_to_status_idx').on(t.toUserId, t.status),
  index('CallInvite_room_idx').on(t.roomId),
])
