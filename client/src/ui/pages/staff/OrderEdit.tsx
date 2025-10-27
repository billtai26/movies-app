
import React from 'react'
export default function OrderEdit(){
  return (
    <div className="space-y-3">
      <div className="text-xl font-bold">Sửa thông tin đơn hàng</div>
      <div className="card space-y-2">
        <input className="input" placeholder="Mã đơn hàng"/>
        <input className="input" placeholder="Email mới"/>
        <input className="input" placeholder="SĐT mới"/>
        <button className="btn-primary">Lưu thay đổi</button>
      </div>
    </div>
  )
}
