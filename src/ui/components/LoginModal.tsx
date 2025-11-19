import React from 'react'
import { useAuth } from '../../store/auth'
import { api } from '../../lib/api'
import { Eye, EyeOff, X } from 'lucide-react'
import LoadingOverlay from "./LoadingOverlay";
import { useState } from "react";
import { toast } from 'react-toastify';

interface Props {
  open: boolean
  onClose: () => void
  onRegisterClick: () => void
  onForgotPasswordClick: () => void
  onLoginSuccess?: () => void
}

export default function LoginModal({ open, onClose, onRegisterClick, onForgotPasswordClick, onLoginSuccess }: Props) {
  // const login = useAuth(s=>s.login)
  const [email,setEmail] = React.useState('')
  const [password,setPassword] = React.useState('')
  const [showPwd,setShowPwd] = React.useState(false)
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(()=>{
    if(!open){ setEmail(''); setPassword(''); setShowPwd(false); setError(''); setPwdFieldError('') }
  },[open])

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault()
    if(!email || !password){  
      // ❌ Bỏ alert('⚠️ Vui lòng nhập email và mật khẩu'); 
      toast.warning('⚠️ Vui lòng nhập email và mật khẩu!'); // ✅ Thay bằng toast
      return 
    }
    try{
      setIsLoading(true);
      const data = await api.login(email, password)
      // Kiểm tra xem có token không
      if (!data || !data.token) { 
        throw new Error((data && data.message) || 'Đăng nhập thất bại') 
      }

      // --- SỬA ĐOẠN NÀY ---
      
      // 1. Log ra xem backend thực sự trả về cái gì (F12 -> Console)
      console.log("Login Response Data:", data);

      // 2. Mapping lại tên trường cho đúng với Backend (username & avatarUrl)
      // Ưu tiên lấy data.user.username trước, nếu không có mới lấy data.user.name
      const name = data.user?.username || data.user?.name || email.split('@')[0];
      
      // Ưu tiên lấy data.user.avatarUrl trước (đây là cái Backend của bạn trả về)
      const avatarUrl = data.user?.avatarUrl || data.user?.avatar || `https://i.pravatar.cc/150?u=${email}`;

      // 3. Lưu vào session
      useAuth.getState().setSession({ 
        token: data.token, 
        name: name, 
        email: email, 
        avatar: avatarUrl, 
        role: data.user?.role || 'user' 
      })
       // ✅ QUAN TRỌNG: Đã di chuyển vào đây (chỉ chạy khi thành công)
      toast.success('Đăng nhập thành công!')
      setTimeout(() => {
        onClose()
        onLoginSuccess?.()
      }, 1500)
    }catch(err:any){
      // --- HIỂN THỊ LỖI ---
      const errorMsg = err?.response?.data?.errors || err?.response?.data?.message || err?.message || 'Vui lòng thử lại.';
      toast.error(`${errorMsg}`);
    } finally {
      setIsLoading(false); // Tắt loading
    }
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
          {/* <img src="/images/login-banner.png" alt="banner" className="w-40 h-32 object-contain" /> */}
          <h3 className="text-lg font-semibold">Đăng Nhập Tài Khoản</h3>
        </div>
        {error && (
          <p className="mt-3 text-center text-red-600 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" placeholder="Nhập Email" />
          </div>
          <div>
            <label className="text-sm text-gray-700">Mật khẩu</label>
              <div className="mt-1 relative">
              <input
                type={showPwd? 'text':'password'}
                value={password}
                onCompositionStart={()=>setComposing(true)}
                onCompositionEnd={()=>setComposing(false)}
                onKeyDown={e=>{
                  if (!composing) return
                  const k = e.key
                  const accentKeys = ['s','f','r','x','j','w','d','S','F','R','X','J','W','D']
                  if (accentKeys.includes(k)){
                    e.preventDefault()
                    setPassword(p=> p + k)
                  }
                }}
                onBeforeInput={handlePwdBeforeInput}
                onPaste={handlePwdPaste}
                onChange={e=> { setPassword(e.target.value); if (pwdFieldError && e.target.value) setPwdFieldError('') }}
                className={`w-full rounded border px-3 py-2 pr-10 ${pwdFieldError? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Nhập Mật khẩu"
              />
              <button type="button" onClick={()=>setShowPwd(s=>!s)} className="absolute right-2 top-2 text-gray-500" title={showPwd? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                {showPwd? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              </div>
              {pwdFieldError && <p className="text-xs text-red-600 mt-1">{pwdFieldError}</p>}
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
      {/* Đặt LoadingOverlay ở đây */}
      <LoadingOverlay isLoading={isLoading} message="Đang đăng nhập..." />
    </div>
  )
}
