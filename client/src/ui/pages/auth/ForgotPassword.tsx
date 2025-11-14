import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'

export default function ForgotPassword() {
  const nav = useNavigate()

  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const sendRequest = async () => {
    if (!email) return alert("Vui lòng nhập email!")

    try {
      setLoading(true)
      await api.post('/auth/forgot-password', { email })

      alert("Đã gửi mã OTP đến email của bạn!")
      nav('/auth/reset-password', { state: { email } })

    } catch (err: any) {
      alert("Email không tồn tại!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-gray-800/40 p-8 rounded-2xl shadow-2xl text-white border border-white/20">
      
      <h2 className="text-3xl font-bold text-center mb-2 text-blue-400">Quên mật khẩu</h2>
      
      <p className="text-center text-sm text-gray-300 mb-6">
        Nhập email để nhận mã OTP đặt lại mật khẩu
      </p>

      <input
        className="input w-full bg-transparent border border-gray-500 text-white placeholder-gray-400 mb-4"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        className="btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white mb-4"
        disabled={loading}
        onClick={sendRequest}
      >
        {loading ? "Đang gửi..." : "Gửi yêu cầu"}
      </button>

      <div className="flex justify-between text-sm">
        <button onClick={() => nav('/auth/login')} className="text-blue-400 hover:underline">
          Đăng nhập
        </button>
        <button onClick={() => nav('/auth/register')} className="text-blue-400 hover:underline">
          Đăng ký
        </button>
      </div>
    </div>
  )
}
