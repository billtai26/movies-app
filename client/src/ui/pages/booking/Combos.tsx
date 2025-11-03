
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/mockApi'

export default function Combos(){
  const nav = useNavigate()
  const { state } = useLocation() as any
  const [items, setItems] = React.useState<any[]>([])
  const [qty, setQty] = React.useState<Record<string,number>>({})
  React.useEffect(()=>{ api.listCombos().then(setItems) },[])
  const total = Object.entries(qty).reduce((s,[id,n])=> s + (items.find(i=>i.id===id)?.price||0)*n, 0)
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 card">
        <div className="mb-3 text-lg font-semibold">Chọn Combo / Sản phẩm</div>
        <div className="space-y-4">
          {items.map(cb => (
            <div key={cb.id} className="flex items-center gap-4 rounded-xl border p-4 dark:border-gray-700 hover:shadow-md transition-shadow">
              {/* Hình ảnh combo */}
              <div className="flex-shrink-0">
                <img 
                  src={cb.image || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop"} 
                  alt={cb.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              </div>
              
              {/* Thông tin combo */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg">{cb.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {cb.items.join(' • ')}
                </div>
                <div className="text-lg font-bold text-brand mt-2">
                  {cb.price.toLocaleString()} đ
                </div>
              </div>
              
              {/* Điều chỉnh số lượng */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <button 
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    onClick={()=> setQty(q => ({...q, [cb.id]: Math.max(0,(q[cb.id]||0)-1)}))}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{qty[cb.id]||0}</span>
                  <button 
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    onClick={()=> setQty(q => ({...q, [cb.id]: (q[cb.id]||0)+1}))}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="card">
          <div className="mb-2 font-semibold">Tóm tắt</div>
          <div>Combo: <b>{total.toLocaleString()} đ</b></div>
        </div>
        <div className="flex justify-between">
          <button className="btn-outline" onClick={()=>nav(-1)}>Quay lại</button>
          <button className="btn-primary" onClick={()=>nav('/booking/payment',{ state:{ ...state, qty }})}>Tiếp tục</button>
        </div>
      </div>
    </div>
  )
}
