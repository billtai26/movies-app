import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const nav = useNavigate()

  return (
    <div className="auth-card backdrop-blur-md bg-white/10 dark:bg-gray-800/40 p-8 rounded-2xl shadow-2xl text-white border border-white/20">
      <h2 className="text-3xl font-bold text-center mb-2 text-blue-400">Tạo tài khoản</h2>
      <p className="text-center text-sm text-gray-300 mb-6">Gia nhập cùng Cinesta để bắt đầu hành trình phim ảnh!</p>

      <input className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3" placeholder="Họ tên" />
      <input className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3" placeholder="Email" />
      <input className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-4" placeholder="Mật khẩu" type="password" />

      <button className="btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white mb-4">Tạo tài khoản</button>

      <div className="flex justify-between text-sm">
        <button onClick={() => nav('/auth/login')} className="text-blue-400 hover:underline">
          Đăng nhập
        </button>
        <button onClick={() => nav('/auth/forgot-password')} className="text-blue-400 hover:underline">
          Quên mật khẩu?
        </button>
      </div>
    </div>
  )
}
