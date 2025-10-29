
import React from 'react'
export default function Offers(){
  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold">Tin khuyến mãi</div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({length:6}).map((_,i)=>(
          <div key={i} className="card">
            <img src={`https://picsum.photos/600/300?random=${i+40}`} className="mb-2 rounded-xl"/>
            <div className="font-semibold">Khuyến mãi #{i+1}</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Nội dung ưu đãi mô phỏng.</p>
          </div>
        ))}
      </div>
    </div>
  )
}
