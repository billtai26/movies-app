
import React from 'react'
export default function Combos(){
  return (
    <div className="space-y-3">
      <div className="text-xl font-bold text-gray-800 dark:text-white">Xử lý combo F&B</div>
      <div className="card space-y-2">
        <input className="input" placeholder="Quét mã combo"/>
        <button className="btn-primary">Xác nhận đã giao</button>
      </div>
    </div>
  )
}
