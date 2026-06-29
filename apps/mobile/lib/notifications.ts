import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'

// Local, offline-first screening reminders. Fits the no-signal core principle:
// the phone schedules the alert itself, so no server/push token is needed.
// Each class gets ONE deterministic notification id so re-picking a date replaces it.

const HOUR = 15 // fire at 15:00...
const DAYS_BEFORE = 1 // ...on the day BEFORE the scheduled screening.
const CHANNEL_ID = 'screening-reminders'

const reminderId = (classId: string) => `screening-reminder-${classId}`

// Foreground display behavior (must be set once before any notification fires).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

/** Day-before-at-15:00 moment for a given screening date (local time). */
const reminderMoment = (scheduledAt: string | Date): Date => {
  const d = new Date(scheduledAt)
  d.setDate(d.getDate() - DAYS_BEFORE)
  d.setHours(HOUR, 0, 0, 0)
  return d
}

const fmtDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

/** Ask for permission once (and set up the Android channel). Returns true if allowed. */
export const ensureNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Скрининг сануулга',
      importance: Notifications.AndroidImportance.HIGH,
    })
  }
  const current = await Notifications.getPermissionsAsync()
  if (current.granted) return true
  if (!current.canAskAgain) return false
  const next = await Notifications.requestPermissionsAsync()
  return next.granted
}

/**
 * (Re)schedule the reminder for one class. Always cancels the previous one first.
 * No-op (and cancels) when there is no date or the reminder moment is already past.
 * Returns the scheduled Date, or null if nothing was scheduled.
 */
export const scheduleScreeningReminder = async (
  klass: { id: string; name: string; scheduledAt: string | null },
): Promise<Date | null> => {
  await cancelScreeningReminder(klass.id)
  if (!klass.scheduledAt) return null

  const when = reminderMoment(klass.scheduledAt)
  if (when.getTime() <= Date.now()) return null // too close / in the past — skip

  const granted = await ensureNotificationPermission()
  if (!granted) return null

  await Notifications.scheduleNotificationAsync({
    identifier: reminderId(klass.id),
    content: {
      title: 'Маргааш шүдний скрининг',
      body: `${klass.name} ангийн шалгалт маргааш (${fmtDate(new Date(klass.scheduledAt))}). Бэлдэхээ мартуузай.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
  })
  return when
}

/** Cancel a class's pending reminder (e.g. date cleared or changed). */
export const cancelScreeningReminder = async (classId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(reminderId(classId)).catch(() => {})
}

/**
 * Reconcile reminders for the full class list (e.g. on screen load) so classes
 * that already had a date keep a live reminder. Silent: only acts when permission
 * is ALREADY granted — never raises a prompt just from opening the calendar.
 */
export const syncScreeningReminders = async (
  classes: { id: string; name: string; scheduledAt: string | null }[],
): Promise<void> => {
  const { granted } = await Notifications.getPermissionsAsync()
  if (!granted) return
  await Promise.all(classes.map((k) => scheduleScreeningReminder(k)))
}
