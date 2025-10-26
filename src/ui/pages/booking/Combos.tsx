
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
        <div className="space-y-3">
          {items.map(cb => (
            <div key={cb.id} className="flex items-center justify-between gap-4 rounded-xl border p-3 dark:border-gray-700">
              <div>
                <div className="font-medium">{cb.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{cb.items.join(', ')}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-24 text-right">{cb.price.toLocaleString()} đ</span>
                <div className="flex items-center gap-2">
                  <button className="btn-outline" onClick={()=> setQty(q => ({...q, [cb.id]: Math.max(0,(q[cb.id]||0)-1)}))}>-</button>
                  <span>{qty[cb.id]||0}</span>
                  <button className="btn-outline" onClick={()=> setQty(q => ({...q, [cb.id]: (q[cb.id]||0)+1}))}>+</button>
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
