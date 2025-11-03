
import React from 'react'
export default function SeatChange(){
  return (
    <div className="space-y-3">
      <div className="text-xl font-bold">Đổi ghế tại quầy</div>
      <div className="card space-y-2">
        <input className="input" placeholder="Mã vé"/>
        <div className="grid gap-2 md:grid-cols-2"><input className="input" placeholder="Ghế cũ"/><input className="input" placeholder="Ghế mới"/></div>
        <button className="btn-primary">Xác nhận đổi ghế</button>
      </div>
    </div>
  )
}
