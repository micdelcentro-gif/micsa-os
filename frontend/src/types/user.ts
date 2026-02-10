export interface User {
  id: string
  username: string
  email?: string
  role: 'super_admin' | 'admin' | 'user' | 'viewer'
  assignedProject?: string
  permissions?: string[]
  twoFactorEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}
