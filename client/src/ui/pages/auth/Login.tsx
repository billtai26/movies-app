import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../store/auth'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    const isValid = login(email, password)
    if (isValid) {
      nav('/')
    } else {
      setError('Email hoặc mật khẩu không đúng')
    }
  }

  // Check for success message from registration
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const registeredEmail = urlParams.get('email')
    if (registeredEmail) {
      setSuccess(`Tài khoản đã được tạo thành công! Email: ${registeredEmail}`)
      setEmail(registeredEmail)
    }
  }, [])

  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-gray-800/40 p-8 rounded-2xl shadow-2xl text-white border border-white/20">
      <h2 className="text-3xl font-bold text-center mb-2 text-blue-400">Đăng nhập</h2>
      <p className="text-center text-sm text-gray-300 mb-6">Chào mừng trở lại Cinesta 🎬</p>

      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <input 
          className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3" 
          placeholder="Email" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-4" 
          placeholder="Mật khẩu" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <div className="text-red-400 text-sm mb-4">{error}</div>
        )}

        <button 
          type="submit"
          className="btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white mb-4"
        >
          Đăng nhập
        </button>
      </form>

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
