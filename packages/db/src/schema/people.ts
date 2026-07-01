import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID())
const ts = (name: string) => integer(name, { mode: 'timestamp_ms' })

export const users = sqliteTable('User', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'screener' | 'dentist' | 'follow_up' | 'admin'
  phone: text('phone'),
  passwordHash: text('passwordHash'),
  schoolId: text('schoolId'),
  avatarUrl: text('avatarUrl'), // profile photo, stored as a data URL (base64)

  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  createdAt: ts('createdAt').notNull().$defaultFn(() => new Date()),
}, (t) => [index('User_phone_idx').on(t.phone)])

export const userScopes = sqliteTable('UserScope', {
  id: id(),
  userId: text('userId').notNull(),
  scopeKind: text('scopeKind').notNull(), // 'child' | 'class' | 'school' | 'district'
  scopeId: text('scopeId').notNull(),
  grantedAt: ts('grantedAt').notNull().$defaultFn(() => new Date()),
  grantedBy: text('grantedBy'),
}, (t) => [
  uniqueIndex('UserScope_user_kind_id_key').on(t.userId, t.scopeKind, t.scopeId),
  index('UserScope_userId_idx').on(t.userId),
  index('UserScope_kind_id_idx').on(t.scopeKind, t.scopeId),
])

export const parentChildLinks = sqliteTable('ParentChildLink', {
  id: id(),
  userId: text('userId').notNull(),
  childKey: text('childKey').notNull(),
  schoolId: text('schoolId').notNull(),
  consentAt: ts('consentAt').notNull(),
}, (t) => [
  uniqueIndex('ParentChildLink_user_child_key').on(t.userId, t.childKey),
  index('ParentChildLink_userId_idx').on(t.userId),
])
