
import React from 'react'
export default function Reports(){
  return (
    <div className="space-y-3">
      <div className="text-xl font-bold">Ghi nhận & báo cáo sự cố</div>
      <div className="card space-y-2">
        <input className="input" placeholder="Tiêu đề sự cố"/>
        <textarea className="input h-28" placeholder="Mô tả chi tiết..."></textarea>
        <button className="btn-primary">Gửi báo cáo</button>
      </div>
    </div>
  )
}
