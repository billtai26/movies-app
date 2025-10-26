
import { create } from 'zustand'
export type Role = 'user'|'staff'|'admin'|null
type AuthState = { token:string|null; role:Role; name:string|null; login:(r:Role,n?:string)=>void; logout:()=>void }
export const useAuth = create<AuthState>((set)=>({
  token:null, role:null, name:null,
  login:(r,n='Guest')=>set({ token:'mock-token', role:r, name:n }),
  logout:()=>set({ token:null, role:null, name:null })
}))
