import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../store/auth'

type Mode = 'login' | 'register'
const BG = [
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1920&auto=format&fit=crop',
]

export default function AuthSwitch() {
  const loc = useLocation()
  const nav = useNavigate()
  const { login } = useAuth()

  const [mode, setMode] = React.useState<Mode>(
    loc.pathname.endsWith('/register') ? 'register' : 'login'
  )
  const [bg, setBg] = React.useState(BG[Math.floor(Math.random() * BG.length)])
  const [fade, setFade] = React.useState(true)
  const [showPw, setShowPw] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setMode(loc.pathname.endsWith('/register') ? 'register' : 'login')
  }, [loc.pathname])

  React.useEffect(() => {
    setFade(false)
    const t = setTimeout(() => setFade(true), 60)
    return () => clearTimeout(t)
  }, [bg])

  const goLogin = () => {
    setMode('login')
    setBg(BG[Math.floor(Math.random() * BG.length)])
    nav('/auth/login')
  }
  const goRegister = () => {
    setMode('register')
    setBg(BG[Math.floor(Math.random() * BG.length)])
    nav('/auth/register')
  }

  // 🟢 API base
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8017/api'

  // 🟢 Đăng nhập thật
  const doLogin = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại!')

      // Lưu vào store
      login(data.role || 'user', data.user?.name || 'User')
      localStorage.setItem('token', data.token)
      alert('✅ Đăng nhập thành công!')
      nav(data.role === 'admin' ? '/admin' : data.role === 'staff' ? '/staff' : '/')
    } catch (err: any) {
      alert(err.message || 'Lỗi đăng nhập!')
    } finally {
      setLoading(false)
    }
  }

  // 🟢 Đăng ký thật
  const doRegister = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại!')
      alert('✅ Đăng ký thành công! Vui lòng đăng nhập.')
      goLogin()
    } catch (err: any) {
      alert(err.message || 'Lỗi đăng ký!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-gray-950 text-gray-100">
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
          fade ? 'opacity-30' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative flex min-h-screen w-screen flex-col md:flex-row">
        <div className="flex flex-1 items-center justify-center bg-gray-900/70 backdrop-blur-sm px-8 py-12">
          <div className="w-full max-w-2xl">
            <div className="text-5xl font-extrabold text-orange-500">
              {mode === 'login' ? 'Cinesta' : 'Gia nhập Cinesta'}
            </div>
            <p className="mt-6 text-lg text-gray-300">
              {mode === 'login'
                ? 'Đặt vé nhanh · Chọn ghế đẹp · Nhận ưu đãi hấp dẫn.'
                : 'Tạo tài khoản để tích điểm, nhận mã giảm giá và quản lý vé.'}
            </p>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          {/* LOGIN */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              doLogin()
            }}
            className={`absolute inset-0 flex items-center justify-center p-8 md:p-12 transition-all duration-700 ${
              mode === 'login'
                ? 'translate-x-0 opacity-100'
                : '-translate-x-full opacity-0 pointer-events-none'
            }`}
          >
            <div className="w-full max-w-md space-y-4">
              <h2 className="text-3xl font-bold">Đăng nhập</h2>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="Nhập email..."
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Nhập mật khẩu..."
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80"
                    onClick={() => setShowPw((s) => !s)}
                  >
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button disabled={loading} className="btn-primary w-full">
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
              <p className="text-sm text-gray-400">
                Chưa có tài khoản?{' '}
                <button type="button" className="underline" onClick={goRegister}>
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </form>

          {/* REGISTER */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              doRegister()
            }}
            className={`absolute inset-0 flex items-center justify-center p-8 md:p-12 transition-all duration-700 ${
              mode === 'register'
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0 pointer-events-none'
            }`}
          >
            <div className="w-full max-w-md space-y-4">
              <h2 className="text-3xl font-bold">Đăng ký</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="label">Họ tên</label>
                  <input
                    className="input"
                    placeholder="Nhập họ tên..."
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="label">Số điện thoại</label>
                  <input
                    className="input"
                    placeholder="Nhập số điện thoại..."
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="Nhập email..."
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Mật khẩu</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Nhập mật khẩu..."
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              <button disabled={loading} className="btn-primary w-full">
                {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </button>
              <p className="text-sm text-gray-400">
                Đã có tài khoản?{' '}
                <button type="button" className="underline" onClick={goLogin}>
                  Đăng nhập
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
