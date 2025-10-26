
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/mockApi'
import SeatMap from '../../components/SeatMap'

export default function Seats(){
  const { id } = useParams()
  const nav = useNavigate()
  const [st, setSt] = React.useState<any>(null)
  const [movie, setMovie] = React.useState<any>(null)
  const [selected, setSelected] = React.useState<string[]>([])
  React.useEffect(()=>{ if(!id) return; api.getShowtime(id).then((s)=>{ setSt(s as any); if(s) api.getMovie(s.movieId).then(setMovie) }) },[id])
  const total = (st?.price||0) * selected.length
  if(!st) return <div>Đang tải...</div>
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <div className="card">
          <div className="mb-2 font-semibold">Đổi suất chiếu</div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-outline">19:00</button>
            <button className="btn-outline">21:00</button>
          </div>
        </div>
        <SeatMap onChange={setSelected}/>
        <div className="card text-xs text-gray-600 dark:text-gray-300">
          <div className="flex flex-wrap gap-4">
            <div className="chip">Ghế đã bán</div>
            <div className="chip" style={{border:'1px solid var(--brand)'}}>Ghế đang chọn</div>
            <div className="chip">Ghế VIP</div>
            <div className="chip">Ghế đôi</div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="card space-y-2">
          <div className="flex gap-3">
            <img src={movie?.poster} className="h-24 w-16 rounded-lg object-cover"/>
            <div className="text-sm">
              <div className="font-semibold">{movie?.title}</div>
              <div className="chip-brand mt-1 rounded-md">P{movie?.rating}</div>
              <div className="mt-1 opacity-80">Suất: {new Date(st.startTime).toLocaleString()}</div>
            </div>
          </div>
          <hr className="border-dashed dark:border-gray-700"/>
          <div>Ghế: {selected.join(', ') || 'Chưa chọn'}</div>
          <div className="flex items-center justify-between"><span>Tổng cộng</span><b>{total.toLocaleString()} đ</b></div>
        </div>
        <div className="flex justify-between">
          <button className="btn-outline" onClick={()=>nav('/booking/select')}>Quay lại</button>
          <button className="btn-primary" onClick={()=>nav('/booking/combos',{ state:{ id, selected }})}>Tiếp tục</button>
        </div>
      </div>
    </div>
  )
}
