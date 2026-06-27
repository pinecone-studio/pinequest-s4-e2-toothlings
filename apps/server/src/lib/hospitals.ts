/** Nearest-clinic guide for referral (yellow/red kids). Demo lookup by school. */
export type HospitalGuide = {
  name: string
  address: string
  distanceKm: number
  travelMinutes: number
  schedule: string
  phone: string
}

const BY_SCHOOL: Record<string, HospitalGuide> = {
  'school-demo': {
    name: 'Сүхбаатар дүүргийн нэгдсэн эмнэлэг — Шүдний тасаг',
    address: 'Улаанбаатар, СБД, 1-р хороо',
    distanceKm: 2.4,
    travelMinutes: 12,
    schedule: 'Даваа–Баасан 08:00–17:00',
    phone: '+976 7011 2233',
  },
  'school-kharkhorin': {
    name: 'Хархорин сумын эрүүл мэндийн төв — Шүдний кабинет',
    address: 'Өвөрхангай аймаг, Хархорин сум',
    distanceKm: 5.1,
    travelMinutes: 18,
    schedule: 'Даваа–Баасан 09:00–16:00',
    phone: '+976 7032 4455',
  },
}

const DEFAULT: HospitalGuide = {
  name: 'Аймгийн нэгдсэн эмнэлэг — Шүдний кабинет',
  address: 'Аймгийн төв',
  distanceKm: 8.0,
  travelMinutes: 25,
  schedule: 'Даваа–Баасан 09:00–16:00',
  phone: '+976 7000 0000',
}

/** Returns a guide only for kids who need a referral; null for green. */
export const hospitalForChild = (schoolId: string, level: string): HospitalGuide | null =>
  level === 'green' ? null : (BY_SCHOOL[schoolId] ?? DEFAULT)
