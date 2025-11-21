
import { create } from 'zustand'

export type Role = 'user' | 'staff' | 'admin' | null

type AuthState = {
  _id: string | null
  token: string | null
  role: Role
  name: string | null
  email: string | null
  avatar: string | null
  userId: string | null
  // login hỗ trợ cả hai dạng gọi:
  // 1) login(role, name?, avatar?)
  // 2) login(email, password, role?)
  login: (...args: any[]) => void
  setSession: (payload: { token: string; name?: string; email?: string; avatar?: string; role?: Role; userId?: string }) => void
  logout: () => void
  updateAvatar: (avatar: string) => void
  updateProfile: (payload: { name?: string; email?: string; avatar?: string }) => void
}

const loadPersisted = () => {
  try {
    const raw = localStorage.getItem('auth')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const useAuth = create<AuthState>((set, get) => {
  const persisted = loadPersisted()

  const persist = (next: Partial<AuthState>) => {
    const state = { ...get(), ...next }
    const toSave = {
      token: state.token,
      role: state.role,
      name: state.name,
      email: state.email,
      avatar: state.avatar,
      userId: state.userId,
    }
    try { localStorage.setItem('auth', JSON.stringify(toSave)) } catch {}
    set(next as any)
  }

  return {
    _id: persisted?._id ?? null,
    token: persisted?.token ?? null,
    role: persisted?.role ?? null,
    name: persisted?.name ?? null,
    email: persisted?.email ?? null,
    avatar: persisted?.avatar ?? null,
    userId: persisted?.userId ?? null,

    login: (...args: any[]) => {
      let role: Role = 'user'
      let name: string | null = null
      let email: string | null = null
      let avatar: string | null = null

      // Dạng (role, name?, avatar?)
      if (args[0] === 'user' || args[0] === 'staff' || args[0] === 'admin') {
        role = args[0]
        name = args[1] ?? 'Guest'
        avatar = args[2] ?? null
      } else {
        // Dạng (email, password, role?)
        email = args[0] ?? null
        role = (args[2] as Role) ?? 'user'
        name = email ? String(email).split('@')[0] : 'Guest'
      }

      const token = 'mock-token'
      persist({ token, role, name, email, avatar })
    },

    setSession: ({ token, name, email, avatar, role, userId }: { token: string; name?: string; email?: string; avatar?: string; role?: Role; userId?: string }) => {
      persist({ token, role: role ?? 'user', name: name ?? get().name, email: email ?? get().email, avatar: avatar ?? get().avatar, userId: userId ?? get().userId })
    },

    logout: () => {
      try { localStorage.removeItem('auth') } catch {}
      set({ token: null, role: null, name: null, email: null, avatar: null, userId: null })
    },

    updateAvatar: (newAvatar: string) => {
      persist({ avatar: newAvatar })
    },

    updateProfile: (payload) => {
      const next = {
        name: payload.name !== undefined ? payload.name : get().name,
        email: payload.email !== undefined ? payload.email : get().email,
        avatar: payload.avatar !== undefined ? payload.avatar : get().avatar,
      }
      persist(next)
    },
  }
})
