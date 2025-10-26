
import React from 'react'
import { useAuth } from './store/auth'
import { Navigate, Outlet } from 'react-router-dom'
export const RequireAuth: React.FC<{roles?:('user'|'staff'|'admin')[]}> = ({ roles }) => {
  const { token, role } = useAuth()
  if (!token) return <Navigate to="/auth/login" replace />
  if (roles && role && !roles.includes(role)) return <Navigate to="/" replace />
  return <Outlet/>
}
