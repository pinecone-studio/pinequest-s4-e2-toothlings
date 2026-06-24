import bcrypt from 'bcryptjs'
import { prisma } from '../src/index.js'

// Idempotent dev seed. Login: admin@screener.mn / admin123
const main = async (): Promise<void> => {
  const passwordHash = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@screener.mn' },
    update: {},
    create: { email: 'admin@screener.mn', name: 'Админ', role: 'admin', passwordHash },
  })

  await prisma.user.upsert({
    where: { email: 'screener@screener.mn' },
    update: {},
    create: { email: 'screener@screener.mn', name: 'Шинжээч', role: 'screener', passwordHash },
  })

  await prisma.contentVersion.upsert({
    where: { id: 'content-v1' },
    update: {},
    create: { id: 'content-v1', version: '2026.1', locale: 'mn', publishedById: admin.id },
  })

  const school = await prisma.school.upsert({
    where: { id: 'school-demo' },
    update: {},
    create: { id: 'school-demo', name: 'Сүхбаатар дүүрэг 23-р сургууль', soumCode: 'UB-SBD' },
  })

  await prisma.schoolClass.upsert({
    where: { schoolId_name_seasonId: { schoolId: school.id, name: '3А', seasonId: '2026-spring' } },
    update: {},
    create: { id: 'class-demo', schoolId: school.id, name: '3А', seasonId: '2026-spring', gradeLevel: 3 },
  })

  console.log('Seed complete — login: admin@screener.mn / admin123')
}

void main().finally(() => prisma.$disconnect())
