import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../store/auth'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const doLogin = async () => {
    try {
      if (!email || !password) {
        alert("Vui lòng nhập email và mật khẩu!")
        return
      }

      setLoading(true)
      const user = await login(email, password)

      if (!user) throw new Error("Login failed")

      // Điều hướng theo role BE trả về
      if (user.role === 'admin') nav('/admin')
      else if (user.role === 'staff') nav('/staff')
      else nav('/')

    } catch (err) {
      alert("Email hoặc mật khẩu không đúng!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card backdrop-blur-md bg-white/10 dark:bg-gray-800/40 p-6 sm:p-8 rounded-2xl shadow-2xl text-white border border-white/20">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-blue-400">
        Đăng nhập
      </h2>

      <p className="text-center text-xs sm:text-sm text-gray-300 mb-6">
        Chào mừng trở lại Cinesta 🎬
      </p>

      {/* EMAIL */}
      <input
        className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* PASSWORD */}
      <input
        className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-4 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Mật khẩu"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* LOGIN BUTTON */}
      <button
        className="btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white mb-4 py-2 rounded-md text-sm sm:text-base transition"
        disabled={loading}
        onClick={doLogin}
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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
