import bcrypt from 'bcryptjs'
import { users, schools, schoolClasses, type DB } from '@pinequest/db/d1'
import { seedDemo } from './seedDemo.js'
import { seedDentists } from './seedDentists.js'

// Idempotent dev seed. Login: admin@screener.mn / admin123
export const runSeed = async (db: DB): Promise<{ adminId: string }> => {
  const passwordHash = await bcrypt.hash('admin123', 10)
  const adminId = 'user-admin'

  await db.insert(users).values({ id: adminId, email: 'admin@screener.mn', name: 'Админ', role: 'admin', passwordHash }).onConflictDoNothing()
  await db.insert(users).values({ id: 'user-screener', email: 'screener@screener.mn', name: 'Шинжээч', role: 'screener', passwordHash }).onConflictDoNothing()
  await db.insert(schools).values({ id: 'school-demo', name: 'Сүхбаатар дүүрэг 23-р сургууль', soumCode: 'UB-SBD' }).onConflictDoNothing()
  await db.insert(schoolClasses).values({ id: 'class-demo', schoolId: 'school-demo', name: '3А', seasonId: '2026-spring', gradeLevel: 3 }).onConflictDoNothing()

  await seedDemo(db, adminId) // children + screenings + findings + reviews + follow-ups
  await seedDentists(db, passwordHash) // 3 volunteer dentists for the mobile picker

  return { adminId }
}
