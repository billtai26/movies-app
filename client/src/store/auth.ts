
import { create } from 'zustand'

export type Role = 'user'|'staff'|'admin'|null
export type User = {
  id: string
  name: string
  email: string
  password: string
  role: Role
  avatar?: string
  phone?: string
  dob?: string
}

type AuthState = { 
  token: string | null
  role: Role
  name: string | null
  email: string | null
  avatar: string | null
  phone: string | null
  dob: string | null
  users: User[]
  login: (email: string, password: string) => boolean
  register: (name: string, email: string, password: string) => boolean
  updateAvatar: (avatar: string) => void
  updateProfile: (name: string, email: string, phone?: string, dob?: string) => void
  getCurrentUser: () => User | null
  logout: () => void
}

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  role: null,
  name: null,
  email: null,
  avatar: null,
  phone: null,
  dob: null,
  users: [
    // Default admin and staff accounts
    { id: '1', name: 'Admin', email: 'admin@cinesta.com', password: 'admin123', role: 'admin' },
    { id: '2', name: 'Staff', email: 'staff@cinesta.com', password: 'staff123', role: 'staff' }
  ],
  
  login: (email: string, password: string) => {
    const { users } = get()
    const user = users.find(u => u.email === email && u.password === password)
    
    if (user) {
      set({ 
        token: 'mock-token', 
        role: user.role, 
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        phone: user.phone || null,
        dob: user.dob || null
      })
      return true
    }
    return false
  },
  
  register: (name: string, email: string, password: string) => {
    const { users } = get()
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
      return false
    }
    
    // Add new user
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role: 'user'
    }
    
    set({ users: [...users, newUser] })
    return true
  },
  
  updateAvatar: (avatar: string) => {
    set({ avatar })
    // Also update the user in the users array
    const { users, name } = get()
    const updatedUsers = users.map(user => 
      user.name === name ? { ...user, avatar } : user
    )
    set({ users: updatedUsers })
  },

  updateProfile: (name: string, email: string, phone?: string, dob?: string) => {
    set({ name, email, phone: phone || null, dob: dob || null })
    // Also update the user in the users array
    const { users } = get()
    const updatedUsers = users.map(user => 
      user.email === email ? { ...user, name, phone, dob } : user
    )
    set({ users: updatedUsers })
  },

  getCurrentUser: () => {
    const { users, email } = get()
    return users.find(user => user.email === email) || null
  },
  
  logout: () => set({ token: null, role: null, name: null, email: null, avatar: null, phone: null, dob: null })
}))
