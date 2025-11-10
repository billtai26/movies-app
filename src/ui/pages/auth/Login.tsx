import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../store/auth'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()

  const go = (role: 'user' | 'staff' | 'admin') => {
    // Sử dụng avatar cố định dựa trên role để đảm bảo nhất quán
    const avatarUrl = `https://i.pravatar.cc/150?u=${role}@example.com`
    login(role, role.toUpperCase(), avatarUrl)
    nav(role === 'user' ? '/' : '/' + role)
  }

  return (
    <div className="auth-card backdrop-blur-md bg-white/10 dark:bg-gray-800/40 p-6 sm:p-8 rounded-2xl shadow-2xl text-white border border-white/20">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-blue-400">
        Đăng nhập
      </h2>
      <p className="text-center text-xs sm:text-sm text-gray-300 mb-6">
        Chào mừng trở lại Only Cinema 🎬
      </p>

      <input
        className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Email"
      />
      <input
        className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-4 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Mật khẩu"
        type="password"
      />

      <button
        className="btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white mb-2 py-2 rounded-md text-sm sm:text-base transition"
        onClick={() => go('user')}
      >
        Đăng nhập (User)
      </button>
      <button
        className="btn-outline w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white mb-2 py-2 rounded-md text-sm sm:text-base transition"
        onClick={() => go('staff')}
      >
        Đăng nhập (Staff)
      </button>
      <button
        className="btn-outline w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white py-2 rounded-md text-sm sm:text-base transition"
        onClick={() => go('admin')}
      >
        Đăng nhập (Admin)
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-xs sm:text-sm gap-2">
        <button
          onClick={() => nav('/auth/register')}
          className="text-blue-400 hover:underline"
        >
          Đăng ký tài khoản
        </button>
        <button
          onClick={() => nav('/auth/forgot-password')}
          className="text-blue-400 hover:underline"
        >
          Quên mật khẩu?
        </button>
      </div>
    </div>
  )
}
