import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../store/auth'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    if (!validateEmail(email)) {
      setError('Email không hợp lệ')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    const success = register(name, email, password)
    if (success) {
      // Redirect to login with success message
      nav(`/auth/login?email=${encodeURIComponent(email)}`)
    } else {
      setError('Email này đã được sử dụng')
    }
  }

  return (
    <div className="auth-card backdrop-blur-md bg-white/10 dark:bg-gray-800/40 p-8 rounded-2xl shadow-2xl text-white border border-white/20">
      <h2 className="text-3xl font-bold text-center mb-2 text-blue-400">Tạo tài khoản</h2>
      <p className="text-center text-sm text-gray-300 mb-6">Gia nhập cùng Cinesta để bắt đầu hành trình phim ảnh!</p>

      <form onSubmit={handleRegister}>
        <input 
          className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3" 
          placeholder="Họ tên" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3" 
          placeholder="Email" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3" 
          placeholder="Mật khẩu" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input 
          className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-4" 
          placeholder="Xác nhận mật khẩu" 
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && (
          <div className="text-red-400 text-sm mb-4">{error}</div>
        )}

        <button 
          type="submit"
          className="btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white mb-4"
        >
          Tạo tài khoản
        </button>
      </form>

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
