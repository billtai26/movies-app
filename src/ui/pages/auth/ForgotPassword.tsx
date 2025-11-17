import React from 'react'
import { useNavigate } from 'react-router-dom'
// Giả sử bạn import 'api' giống như bên ResetPassword.tsx
import { api } from '../../../lib/api' 

export default function ForgotPassword() {
  const nav = useNavigate()
  // 1. Thêm state để lưu email
  const [email, setEmail] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  // 2. Thêm hàm handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      alert('⚠️ Vui lòng nhập email của bạn')
      return
    }
    
    setIsLoading(true)
    try {
      // 3. Gọi API forgotPassword
      const res = await api.requestPasswordReset(email)
      alert(res?.message || '✅ Đã gửi yêu cầu. Vui lòng kiểm tra email của bạn!')
      // (Bạn có thể chọn ở lại trang hoặc chuyển đi đâu đó)
      // nav('/auth/login') 
    } catch (err: any) {
      alert(`Lỗi: ${err?.response?.data?.message || err?.message || 'Vui lòng thử lại.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="backdrop-blur-md bg-white/10 p-8 rounded-2xl shadow-2xl text-white border border-white/20">
      <h2 className="text-3xl font-bold text-center mb-2 text-blue-400">Quên mật khẩu</h2>
      <p className="text-center text-sm text-gray-300 mb-6">Nhập email để nhận liên kết đặt lại mật khẩu</p>

      {/* 4. Kết nối form và input */}
      <form onSubmit={handleSubmit}>
        <input 
          className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-4" 
          placeholder="Email" 
          type="email" // Thêm type="email" để validate tốt hơn
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button 
          type="submit" // Thêm type="submit"
          className="btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white mb-4"
          disabled={isLoading} // Vô hiệu hóa nút khi đang tải
        >
          {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </form>
      {/* (Phần còn lại giữ nguyên) */}
      <div className="flex justify-between text-sm">
        <button onClick={() => nav('/auth/login')} className="text-blue-400 hover:underline">
          Đăng nhập
        </button>
        <button onClick={() => nav('/auth/register')} className="text-blue-400 hover:underline">
          Đăng ký
        </button>
      </div>
      
      <div className="text-center mt-4">
        <button onClick={() => nav('/')} className="text-orange-400 hover:underline text-sm">
          ← Về trang chính
        </button>
      </div>
    </div>
  )
}
