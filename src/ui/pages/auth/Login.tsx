import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../store/auth'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()

  const go = (role: 'user' | 'staff' | 'admin') => {
    login(role, role.toUpperCase())
    nav(role === 'user' ? '/' : '/' + role)
  }

  return (
    <div className="auth-card backdrop-blur-md bg-white/10 dark:bg-gray-800/40 p-8 rounded-2xl shadow-2xl text-white border border-white/20">
      <h2 className="text-3xl font-bold text-center mb-2 text-blue-400">Đăng nhập</h2>
      <p className="text-center text-sm text-gray-300 mb-6">Chào mừng trở lại Cinesta 🎬</p>

      <input className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3" placeholder="Email" />
      <input className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-4" placeholder="Mật khẩu" type="password" />

      <button className="btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white mb-2" onClick={() => go('user')}>
        Đăng nhập (User)
      </button>
      <button className="btn-outline w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white mb-2" onClick={() => go('staff')}>
        Đăng nhập (Staff)
      </button>
      <button className="btn-outline w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white" onClick={() => go('admin')}>
        Đăng nhập (Admin)
      </button>

      <div className="flex justify-between mt-4 text-sm">
        <button onClick={() => nav('/auth/register')} className="text-blue-400 hover:underline">
          Đăng ký tài khoản
        </button>
        <button onClick={() => nav('/auth/forgot-password')} className="text-blue-400 hover:underline">
          Quên mật khẩu?
        </button>
      </div>
    </div>
  )
}
