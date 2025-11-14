// src/store/auth.ts
import { create } from 'zustand'
import axios from 'axios'
import { BASE_URL } from '../lib/config'

export type Role = 'user' | 'staff' | 'admin'

interface AuthState {
  token: string | null
  user: {
    name: string | null
    email: string | null
    role: Role | null
  }
  loading: boolean

  login: (email: string, password: string) => Promise<any>
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>
  logout: () => void
  load: () => void
  isAuthenticated: () => boolean
}

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  loading: false,

  user: {
    name: null,
    email: null,
    role: null,
  },

  // =====================================
  // 🟢 LOGIN
  // =====================================
  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password })
      const { token, user } = res.data

      // Save localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))

      // Set axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      set({
        token,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })

      return user
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || 'Login failed')
    } finally {
      set({ loading: false })
    }
  },

  // =====================================
  // 🟣 REGISTER
  // =====================================
  // FE sẽ gửi: { name, email, password, phone }
  register: async (data) => {
    set({ loading: true })
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, data)
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || 'Register failed')
    } finally {
      set({ loading: false })
    }
  },

  // =====================================
  // 🔒 LOGOUT
  // =====================================
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')

    delete axios.defaults.headers.common['Authorization']

    set({
      token: null,
      user: { name: null, email: null, role: null },
    })
  },

  // =====================================
  // ⚙️ LOAD FROM LOCALSTORAGE
  // =====================================
  load: () => {
    const token = localStorage.getItem('auth_token')
    const user = JSON.parse(localStorage.getItem('auth_user') || 'null')

    if (token && user) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      set({
        token,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    }
  },

  // =====================================
  // 🧠 CHECK AUTH
  // =====================================
  isAuthenticated: () => {
    return !!get().token
  },
}))
