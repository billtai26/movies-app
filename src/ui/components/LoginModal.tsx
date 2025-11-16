import React from 'react'
import { useAuth } from '../../store/auth'
import { api } from '../../lib/api'
import { Eye, EyeOff, X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onRegisterClick: () => void
  onForgotPasswordClick: () => void
  onLoginSuccess?: () => void
}

export default function LoginModal({ open, onClose, onRegisterClick, onForgotPasswordClick, onLoginSuccess }: Props) {
  const login = useAuth(s=>s.login)
  const [email,setEmail] = React.useState('')
  const [password,setPassword] = React.useState('')
  const [showPwd,setShowPwd] = React.useState(false)

  React.useEffect(()=>{
    if(!open){ setEmail(''); setPassword(''); setShowPwd(false) }
  },[open])

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault()
    if(!email || !password){ alert('⚠️ Vui lòng nhập email và mật khẩu'); return }
    try{
      const data = await api.login(email, password)
      if (!data || !data.token){ throw new Error((data && data.message) || 'Đăng nhập thất bại') }
      const name = data.user?.name || email.split('@')[0]
      const avatarUrl = data.user?.avatar || `https://i.pravatar.cc/150?u=${email}`
      useAuth.getState().setSession({ token: data.token, name, email, avatar: avatarUrl, role: 'user' })
    }catch(err:any){
      alert(`Đăng nhập thất bại: ${err?.response?.data?.message || err?.message || 'Vui lòng thử lại.'}`)
      return
    }
    onClose()
    // Gọi callback sau khi đăng nhập thành công
    onLoginSuccess?.()
  }

  if(!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-[420px] bg-white rounded-lg shadow-lg p-6">
        <button className="absolute right-3 top-3 text-gray-500" onClick={onClose} aria-label="close">
          <X />
        </button>
        <div className="flex flex-col items-center gap-3">
          <img src="/images/login-banner.png" alt="banner" className="w-40 h-32 object-contain" />
          <h3 className="text-lg font-semibold">Đăng Nhập Tài Khoản</h3>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" placeholder="Nhập Email" />
          </div>
          <div>
            <label className="text-sm text-gray-700">Mật khẩu</label>
            <div className="mt-1 relative">
              <input type={showPwd? 'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded border px-3 py-2 pr-10" placeholder="Nhập Mật khẩu" />
              <button type="button" onClick={()=>setShowPwd(s=>!s)} className="absolute right-2 top-2 text-gray-500">
                {showPwd? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <button type="submit" className="w-full bg-[#f58a1f] hover:bg-[#f07a00] text-white font-medium px-4 py-2 rounded">ĐĂNG NHẬP</button>
          </div>
          <div className="text-center text-sm">
            <button 
              type="button"
              onClick={onForgotPasswordClick}
              className="text-[#f58a1f] hover:text-[#f07a00]"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="mt-2 text-center text-sm">
            Bạn chưa có tài khoản? <button type="button" className="text-[#f58a1f]" onClick={onRegisterClick}>Đăng ký</button>
          </div>
        </form>
      </div>
    </div>
  )
}
