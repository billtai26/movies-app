
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import SeatMap from '../../components/SeatMap'
import Countdown from '../../components/Countdown'
export default function Booking(){
  const { showtimeId } = useParams()
  const nav = useNavigate()
  const [st, setSt] = React.useState<any>(null)
  const [selected, setSelected] = React.useState<string[]>([])
  const [combos, setCombos] = React.useState<any[]>([])
  const [cartCombo, setCartCombo] = React.useState<string[]>([])
  React.useEffect(()=>{ if(!showtimeId) return; api.getShowtime(showtimeId).then(setSt); api.listCombos().then(setCombos)},[showtimeId])
  const total = (st?.price||0) * selected.length + cartCombo.reduce((sum,id)=> sum + (combos.find(c=>c.id===id)?.price||0), 0)
  if(!st) return <div>Đang tải...</div>
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4"><SeatMap onChange={setSelected}/></div>
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Thanh toán</h3><Countdown seconds={300} onExpire={()=>nav('/movies')} /></div>
        <div className="card space-y-2"><div>Số ghế chọn: <b>{selected.length}</b></div><div className="text-sm text-gray-500">{selected.join(', ')||'Chưa chọn'}</div><div>Giá vé: <b>{(st.price||0).toLocaleString()}đ</b> / ghế</div></div>
        <div className="card space-y-2">
          <div className="font-semibold">Combo</div>
          {combos.map(cb => (
            <label key={cb.id} className="flex items-center justify-between rounded-xl border p-2">
              <div><div className="font-medium">{cb.name}</div><div className="text-xs text-gray-500">{cb.items.join(', ')}</div></div>
              <div className="flex items-center gap-2"><span className="text-sm">{cb.price.toLocaleString()}đ</span>
                <input type="checkbox" onChange={(e)=>{ if(e.target.checked) setCartCombo(v=>[...v,cb.id]); else setCartCombo(v=>v.filter(i=>i!==cb.id)) }} /></div>
            </label>
          ))}
        </div>
        <div className="card">
          <div className="mb-2 flex items-center justify-between"><span>Tổng tiền</span><b>{total.toLocaleString()}đ</b></div>
          <button className="btn-primary w-full" onClick={()=>nav('/checkout',{ state:{ showtimeId, selected, cartCombo }})}>Tiếp tục</button>
        </div>
      </div>
    </div>
  )
}
