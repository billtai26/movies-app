
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Payment(){
  const nav = useNavigate()
  const { state } = useLocation() as any
  const [method, setMethod] = React.useState('momo')
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card space-y-3">
        <div className="text-lg font-semibold">Thanh toán</div>
        <label className="flex items-center gap-2"><input type="radio" name="m" checked={method==='momo'} onChange={()=>setMethod('momo')}/> MoMo (mock)</label>
        <label className="flex items-center gap-2"><input type="radio" name="m" checked={method==='zalopay'} onChange={()=>setMethod('zalopay')}/> ZaloPay (mock)</label>
        <label className="flex items-center gap-2"><input type="radio" name="m" checked={method==='card'} onChange={()=>setMethod('card')}/> Thẻ nội địa (mock)</label>
        <button className="btn-primary w-full" onClick={()=>nav('/booking/confirm',{ state:{ ...state, method }})}>Thanh toán (mock)</button>
      </div>
      <div className="card">
        <div className="font-semibold">Chi tiết đơn</div>
        <div className="text-sm text-gray-600 dark:text-gray-300 break-all">{JSON.stringify(state)}</div>
      </div>
    </div>
  )
}
