import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../../lib/api' // Đảm bảo import api

export default function ResetPassword() {
  const nav = useNavigate()
  // 1. Lấy token từ URL
  const { token } = useParams() 

  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 2. Validate dữ liệu
    if (!password) {
      alert('⚠️ Vui lòng nhập mật khẩu mới')
      return
    }
    // Validation backend yêu cầu tối thiểu 6 ký tự
    if (password.length < 6) { 
      alert('⚠️ Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (password !== confirmPassword) {
      alert('⚠️ Mật khẩu xác nhận không khớp')
      return
    }
    if (!token) {
      alert('⚠️ Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
      return
    }

    try {
      // 3. Gọi API
      // (Giả sử bạn đã thêm hàm 'resetPassword' vào 'api' như các bước trước)
      const res = await api.resetPassword(token, password) 
      alert(res?.message || '✅ Đặt lại mật khẩu thành công!')
      // 4. Chuyển về trang đăng nhập
      nav('/auth/login') 
    } catch (err: any) {
      alert(`Lỗi: ${err?.response?.data?.message || err?.message || 'Vui lòng thử lại.'}`)
    }
  }

  return (
    // 5. Dùng layout và style giống các trang auth khác
    // (Lớp CSS ở đây đã gần giống với ForgotPassword)
    <div className="auth-card backdrop-blur-md bg-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl text-white border border-white/20">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-blue-400">
        Đặt Lại Mật Khẩu
      </h2>
      <p className="text-center text-xs sm:text-sm text-gray-300 mb-6">
        Vui lòng nhập mật khẩu mới của bạn.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-3 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Mật khẩu mới"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-4 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Xác nhận mật khẩu mới"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />

        <button type="submit" className="btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white mb-4 py-2 rounded-md text-sm sm:text-base transition"
        >
          XÁC NHẬN
        </button>
      </form>
      
      {/* --- PHẦN THÊM VÀO CHO GIỐNG VỚI FORGOTPASSWORD --- */}
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
      {/* --- KẾT THÚC PHẦN THÊM VÀO --- */}
    </div>
  )
}
