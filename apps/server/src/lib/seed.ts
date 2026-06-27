import bcrypt from 'bcryptjs'
import { users, contentVersions, schools, schoolClasses, type DB } from '@pinequest/db/d1'
import { seedDemo } from './seedDemo.js'

const day = (n: number) => new Date(Date.now() + n * 86_400_000)

// Idempotent dev seed. Login: admin@screener.mn / admin123
export const runSeed = async (db: DB): Promise<{ adminId: string }> => {
  const passwordHash = await bcrypt.hash('admin123', 10)
  const adminId = 'user-admin'

  await db.insert(users).values([
    { id: adminId, email: 'admin@screener.mn', name: 'Админ', role: 'admin', passwordHash },
    { id: 'user-screener', email: 'screener@screener.mn', name: 'Б. Шинжээч', role: 'screener', passwordHash },
    { id: 'user-dentist', email: 'dentist@screener.mn', name: 'Д. Эмч', role: 'dentist', passwordHash },
    { id: 'user-followup', email: 'followup@screener.mn', name: 'С. Хяналт', role: 'follow_up', passwordHash },
    { id: 'user-teacher', email: 'teacher@screener.mn', name: 'Г. Багш', role: 'teacher', passwordHash },
  ]).onConflictDoNothing()
  await db.insert(contentVersions).values([
    { id: 'content-v0', version: '2025.4', locale: 'mn', status: 'published', notes: 'Намрын улирлын зөвлөмж', publishedById: adminId, publishedAt: day(-180) },
    { id: 'content-v1', version: '2026.1', locale: 'mn', status: 'published', notes: 'Идэвхтэй хувилбар', publishedById: adminId, publishedAt: day(-30) },
    { id: 'content-v2', version: '2026.2', locale: 'mn', status: 'draft', notes: 'Шинэчилсэн зөвлөмжийн ноорог — хянагдаж байна', publishedById: adminId },
  ]).onConflictDoNothing()
  await db.insert(schools).values([
    { id: 'school-demo', name: 'Сүхбаатар дүүрэг 23-р сургууль', soumCode: 'UB-SBD' },
    { id: 'school-kharkhorin', name: 'Хархорин сумын ЕБ сургууль', soumCode: 'UV-KHR' },
  ]).onConflictDoNothing()
  await db.insert(schoolClasses).values([
    { id: 'class-demo', schoolId: 'school-demo', name: '3А', seasonId: '2026-spring', gradeLevel: 3, scheduledAt: day(6) },
    { id: 'class-demo-fall', schoolId: 'school-demo', name: '3А', seasonId: '2025-fall', gradeLevel: 3 },
    { id: 'class-khr', schoolId: 'school-kharkhorin', name: '2А', seasonId: '2026-spring', gradeLevel: 2, scheduledAt: day(13) },
  ]).onConflictDoNothing()

  await seedDemo(db, adminId) // children + screenings + findings + questionnaires + images + reviews + follow-ups

  return { adminId }
}
