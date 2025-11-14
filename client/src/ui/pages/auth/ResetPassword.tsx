import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'

export default function ResetPassword() {
  const nav = useNavigate()
  const { state } = useLocation() as any
  const email = state?.email || ''   // lấy email từ ForgotPassword

  const [otp, setOtp] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const doReset = async () => {
    if (!otp || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!")
      return
    }

    try {
      setLoading(true)

      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword: password,
      })

      alert("Đổi mật khẩu thành công! Hãy đăng nhập lại.")
      nav('/auth/login')

    } catch (err: any) {
      alert("OTP không đúng hoặc đã hết hạn!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card space-y-3 p-6 bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 rounded-xl text-white">
      
      <div className="text-center text-2xl font-bold text-brand">
        Đặt lại mật khẩu
      </div>

      <p className="text-center text-gray-300 text-sm mb-2">
        OTP đã gửi tới email:  
        <span className="text-blue-400 font-semibold">{email}</span>
      </p>

      {/* OTP */}
      <input
        className="input"
        placeholder="Mã OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      {/* NEW PASSWORD */}
      <input
        className="input"
        placeholder="Mật khẩu mới"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* SUBMIT */}
      <button
        className="btn-primary w-full"
        onClick={doReset}
        disabled={loading}
      >
        {loading ? "Đang cập nhật..." : "Cập nhật"}
      </button>
    </div>
  )
}
