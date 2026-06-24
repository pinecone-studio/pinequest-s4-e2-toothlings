export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
}

export type UserRole = 'patient' | 'dentist' | 'admin'

export interface UserProfile extends User {
  dateOfBirth?: string
  phone?: string
  dentalHistory?: string[]
}
