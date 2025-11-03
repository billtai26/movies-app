import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../store/auth'

type Mode = 'login' | 'register'
type Role = 'user' | 'staff' | 'admin'

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

  const [mode, setMode] = React.useState<Mode>(loc.pathname.endsWith('/register') ? 'register' : 'login')
  const [bg, setBg] = React.useState(BG[Math.floor(Math.random() * BG.length)])
  const [fade, setFade] = React.useState(true)
  const [showPw, setShowPw] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', email: '', password: '', phone: '' })

  React.useEffect(() => {
    setMode(loc.pathname.endsWith('/register') ? 'register' : 'login')
  }, [loc.pathname])

  React.useEffect(() => {
    setFade(false); const t = setTimeout(() => setFade(true), 60); return () => clearTimeout(t)
  }, [bg])

  const goLogin = () => { setMode('login'); setBg(BG[Math.floor(Math.random()*BG.length)]); nav('/auth/login') }
  const goRegister = () => { setMode('register'); setBg(BG[Math.floor(Math.random()*BG.length)]); nav('/auth/register') }

  const doLogin = async (role: Role) => {
    await login(form.email || 'user@example.com', form.password || '123456', role)
    if (role === 'admin') nav('/admin')
    else if (role === 'staff') nav('/staff')
    else nav('/')
  }

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-gray-950 text-gray-100">
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${fade ? 'opacity-30' : 'opacity-0'}`}
        style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <div className="relative flex min-h-screen w-screen flex-col md:flex-row">
        <div className="flex flex-1 items-center justify-center bg-gray-900/70 backdrop-blur-sm px-8 py-12">
          <div className="w-full max-w-2xl">
            <div className="text-5xl font-extrabold" style={{ color: 'var(--brand)' }}>
              {mode === 'login' ? 'Cinesta' : 'Gia nhập Cinesta'}
            </div>
            <p className="mt-6 text-lg text-gray-300">
              {mode === 'login'
                ? 'Đặt vé nhanh · Chọn ghế đẹp · Nhận ưu đãi hấp dẫn.'
                : 'Tạo tài khoản để tích điểm, nhận mã giảm giá và quản lý vé.'}
            </p>
            <p className="mt-2 text-gray-400">Cinematic experience for movie lovers.</p>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <form
            onSubmit={(e)=>{ e.preventDefault(); doLogin('user') }}
            className={`flex items-center justify-center p-8 md:p-12 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] relative md:absolute md:inset-0
              ${mode==='login' ? 'opacity-100' : 'opacity-0 pointer-events-none md:-translate-x-full'}`}
          >
            <div className="w-full max-w-md bg-white/5 rounded-xl p-6 md:p-8 mx-auto">
              <h2 className="mb-2 text-3xl font-bold">Đăng nhập</h2>
              <p className="mb-6 text-gray-400">Chào mừng trở lại Cinesta!</p>

              <div className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" placeholder="Nhập email..."
                    value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} required />
                </div>
                <div>
                  <label className="label">Mật khẩu</label>
                  <div className="relative">
                    <input type={showPw?'text':'password'} className="input pr-10" placeholder="Nhập mật khẩu..."
                      value={form.password} onChange={(e)=>setForm(f=>({...f,password:e.target.value}))} required />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80" onClick={()=>setShowPw(s=>!s)}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button className="btn-primary w-full">Đăng nhập (User)</button>

                <div className="grid grid-cols-3 gap-2">
                  <button type="button" className="btn-outline" onClick={()=>doLogin('user')}>User</button>
                  <button type="button" className="btn-outline" onClick={()=>doLogin('staff')}>Staff</button>
                  <button type="button" className="btn-outline" onClick={()=>doLogin('admin')}>Admin</button>
                </div>

                <div className="text-sm text-gray-400">
                  Chưa có tài khoản?{' '}
                  <button type="button" className="underline" onClick={goRegister}>Đăng ký ngay</button>
                </div>
              </div>
            </div>
          </form>

          <form
            onSubmit={(e)=>{ e.preventDefault(); alert('Đăng ký (mock) thành công!'); goLogin() }}
            className={`flex items-center justify-center p-8 md:p-12 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] relative md:absolute md:inset-0
              ${mode==='register' ? 'opacity-100' : 'opacity-0 pointer-events-none md:translate-x-full'}`}
          >
            <div className="w-full max-w-md bg-white/5 rounded-xl p-6 md:p-8 mx-auto">
              <h2 className="mb-2 text-3xl font-bold">Đăng ký</h2>
              <p className="mb-6 text-gray-400">Chỉ mất 1 phút để bắt đầu!</p>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Họ tên</label>
                    <input className="input" placeholder="Nhập họ tên..." required
                      value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))}/>
                  </div>
                  <div>
                    <label className="label">Số điện thoại</label>
                    <input className="input" placeholder="Nhập số điện thoại..."
                      value={form.phone} onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))}/>
                  </div>
                </div>

                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" placeholder="Nhập email..." required
                    value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))}/>
                </div>

                <div>
                  <label className="label">Mật khẩu</label>
                  <input type="password" className="input" placeholder="Nhập mật khẩu..." required
                    value={form.password} onChange={(e)=>setForm(f=>({...f,password:e.target.value}))}/>
                </div>

                <button className="btn-primary w-full">Tạo tài khoản</button>

                <div className="text-sm text-gray-400">
                  Đã có tài khoản?{' '}
                  <button type="button" className="underline" onClick={goLogin}>Đăng nhập</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
