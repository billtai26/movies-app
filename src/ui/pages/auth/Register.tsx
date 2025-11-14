import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../store/auth'

export default function Register() {
  const nav = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = React.useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })

  const [loading, setLoading] = React.useState(false)

  const doRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("Vui lòng nhập đầy đủ thông tin!")
      return
    }

    try {
      setLoading(true)
      await register(form)

      alert("Đăng ký thành công! Hãy đăng nhập.")
      nav('/auth/login')

    } catch (err: any) {
      alert("Email đã tồn tại!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card backdrop-blur-md bg-white/10 dark:bg-gray-800/40 p-6 sm:p-8 rounded-2xl shadow-2xl text-white border border-white/20">
      
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-blue-400">
        Tạo tài khoản
      </h2>

      <p className="text-center text-xs sm:text-sm text-gray-300 mb-6">
        Gia nhập cùng Cinesta để bắt đầu hành trình phim ảnh!
      </p>

      {/* HỌ TÊN */}
      <input
        className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Họ tên"
        value={form.name}
        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
      />

      {/* EMAIL */}
      <input
        className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
      />

      {/* PHONE */}
      <input
        className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Số điện thoại (tuỳ chọn)"
        value={form.phone}
        onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
      />

      {/* PASSWORD */}
      <input
        className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-4 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Mật khẩu"
        type="password"
        value={form.password}
        onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
      />

      {/* SUBMIT BUTTON */}
      <button
        className="btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white mb-4 py-2 rounded-md text-sm sm:text-base transition"
        onClick={doRegister}
        disabled={loading}
      >
        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-2 text-xs sm:text-sm gap-2">
        <button
          onClick={() => nav('/auth/login')}
          className="text-blue-400 hover:underline"
        >
          Đăng nhập
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
