
import React from 'react'
export default function ResetPassword(){
  return (
    <div className="card space-y-3">
      <div className="text-center text-2xl font-bold text-brand">Đặt lại mật khẩu</div>
      <input className="input" placeholder="Mã OTP"/>
      <input className="input" placeholder="Mật khẩu mới" type="password"/>
      <button className="btn-primary w-full">Cập nhật</button>
    </div>
  )
}
