
import React from 'react'
export default function PromoControl(){
  return (
    <div className="space-y-3">
      <div className="text-xl font-bold">Ưu đãi tại rạp</div>
      <div className="card space-y-2">
        <input className="input" placeholder="Mã ưu đãi"/>
        <div className="flex gap-2"><button className="btn-primary">Mở khóa</button><button className="btn-outline">Khóa</button></div>
      </div>
    </div>
  )
}
