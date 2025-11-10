
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingBreadcrumb from '../../components/BookingBreadcrumb'
import { api } from '../../../lib/mockApi'

export default function Payment(){
  const nav = useNavigate()
  const { state } = useLocation() as any
  const [method, setMethod] = React.useState('momo')
  const [show, setShow] = React.useState<any>(null)
  const [movie, setMovie] = React.useState<any>(null)
  const [theater, setTheater] = React.useState<any>(null)
  const [room, setRoom] = React.useState<any>(null)
  const [items, setItems] = React.useState<any[]>([])

  const selected:string[] = state?.selected || []
  const qty:Record<string,number> = state?.qty || {}

  React.useEffect(()=>{
    const id = state?.id
    if (!id) return
    ;(async()=>{
      const s = await api.getShowtime(id)
      setShow(s as any)
      const [m, ts, rs, combos] = await Promise.all([
        api.getMovie(s.movieId),
        api.listTheaters(),
        api.listRooms(),
        api.listCombos(),
      ])
      setMovie(m)
      setTheater(ts.find((t:any)=> t.id===s.theaterId))
      setRoom(rs.find((r:any)=> r.id===s.roomId))
      setItems(combos)
    })()
  }, [state?.id])

  const formatVNDate = (dateStr?:string) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    const weekday = ['Chủ nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'][d.getDay()]
    const dd = String(d.getDate()).padStart(2,'0')
    const mm = String(d.getMonth()+1).padStart(2,'0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2,'0')
    const mi = String(d.getMinutes()).padStart(2,'0')
    return `${hh}:${mi} - ${weekday}, ${dd}/${mm}/${yyyy}`
  }

  const aisleCols = [7]
  const basePrice = show?.price || 0
  const couplePrice = basePrice * 2 + 10000

  const seatSummary = React.useMemo(()=>{
    const set = new Set(selected)
    let singles=0, couples=0
    const singleIds:string[]=[]
    const couplePairLabels:string[]=[]
    selected.forEach(id => {
      const row = id[0]
      const col = parseInt(id.slice(1),10)
      if (row==='H'){
        if (col%2===0) return
        const nextCol = col+1
        if (aisleCols.includes(nextCol)){
          singles+=1; singleIds.push(id); return
        }
        const pairIds = [`${row}${col}`,`${row}${nextCol}`]
        if (pairIds.every(sid=> set.has(sid))){
          couples+=1
          const pairIndex = Math.ceil(col/2)
          couplePairLabels.push(`H${pairIndex}`)
        } else { singles+=1; singleIds.push(id) }
      } else { singles+=1; singleIds.push(id) }
    })
    const ticketTotal = singles*basePrice + couples*couplePrice
    return { singles, couples, singleIds, couplePairLabels, ticketTotal }
  }, [selected, basePrice])

  const comboTotal = React.useMemo(()=>{
    return Object.entries(qty).reduce((sum,[id,n])=>{
      const cb = items.find(i=>i.id===id)
      return sum + (cb?.price||0) * (n||0)
    },0)
  }, [qty, items])

  const grandTotal = seatSummary.ticketTotal + comboTotal

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-3"><BookingBreadcrumb currentStep="payment"/></div>

      {/* Cột trái: Khuyến mãi + phương thức thanh toán */}
      <div className="md:col-span-2 space-y-4">
        <div className="card space-y-3">
          <div className="text-base font-semibold">Khuyến mãi</div>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Mã khuyến mãi" />
            <button className="btn-outline">Áp dụng</button>
          </div>
          <div className="text-xs text-gray-500">Lưu ý: demo, không trừ tiền thực.</div>
        </div>

        <div className="card space-y-3">
          <div className="text-base font-semibold">Phương thức thanh toán</div>
          <label className="flex items-center gap-2"><input type="radio" name="m" checked={method==='onepay'} onChange={()=>setMethod('onepay')}/> OnePay (mock)</label>
          <label className="flex items-center gap-2"><input type="radio" name="m" checked={method==='shopeepay'} onChange={()=>setMethod('shopeepay')}/> ShopeePay (mock)</label>
          <label className="flex items-center gap-2"><input type="radio" name="m" checked={method==='momo'} onChange={()=>setMethod('momo')}/> MoMo (mock)</label>
          <label className="flex items-center gap-2"><input type="radio" name="m" checked={method==='zalopay'} onChange={()=>setMethod('zalopay')}/> ZaloPay (mock)</label>
          <label className="flex items-center gap-2"><input type="radio" name="m" checked={method==='card'} onChange={()=>setMethod('card')}/> Thẻ nội địa (mock)</label>
        </div>
      </div>

      {/* Cột phải: Tóm tắt đơn với chữ/số lớn và liên tục */}
      <div className="space-y-4">
        <div className="card p-5 space-y-3">
          <div className="flex gap-4">
            {movie?.poster && (
              <img src={movie.poster} alt={movie?.title||'poster'} className="w-32 h-48 rounded-md object-cover" />
            )}
            <div className="flex-1">
              <div className="text-xl font-semibold">{movie?.title||'—'}</div>
              {movie?.rating!=null && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-700">T{movie.rating}</span>
              )}
            </div>
          </div>
          <div className="text-base">
            <div className="text-gray-600">{theater?.name}{room?.name?` – ${room.name}`:''}</div>
            <div>Suất: {formatVNDate(show?.startTime)}</div>
          </div>
          <hr className="my-3 border-t border-dashed border-gray-300 dark:border-gray-700" />
          <div className="text-base">
            {seatSummary.singles>0 && (
              <div className="flex items-center justify-between">
                <span>{seatSummary.singles}x Ghế đơn</span>
                <b className="text-lg">{(seatSummary.singles*basePrice).toLocaleString()} đ</b>
              </div>
            )}
            {seatSummary.singleIds.length>0 && (
              <div className="text-xs text-gray-600">Ghế: {seatSummary.singleIds.join(', ')}</div>
            )}
            {seatSummary.couples>0 && (
              <div className="flex items-center justify-between">
                <span>{seatSummary.couples}x Ghế đôi</span>
                <b className="text-lg">{(seatSummary.couples*couplePrice).toLocaleString()} đ</b>
              </div>
            )}
            {seatSummary.couplePairLabels.length>0 && (
              <div className="text-xs text-gray-600">Ghế: {seatSummary.couplePairLabels.join(', ')}</div>
            )}
            {seatSummary.singles===0 && seatSummary.couples===0 && (
              <div className="text-xs text-gray-500">Ghế: Chưa chọn</div>
            )}
          </div>

          {/* Ngăn giữa phần ghế và combo */}
          <hr className="my-3 border-t border-dashed border-gray-300 dark:border-gray-700" />
          {Object.entries(qty).filter(([_,n])=> (n||0)>0).map(([id,n])=>{
            const cb = items.find(i=>i.id===id)
            const subtotal = (cb?.price||0) * (n||0)
            return (
              <div key={id} className="flex items-center justify-between">
                <span className="text-base">{n}x {cb?.name||'Combo'}</span>
                <b className="text-lg">{subtotal.toLocaleString()} đ</b>
              </div>
            )
          })}
          <hr className="my-3 border-t border-dashed border-gray-300 dark:border-gray-700" />
          <div className="flex items-center justify-between text-xl font-bold"><span>Tổng cộng</span><b className="text-2xl text-orange-600">{grandTotal.toLocaleString()} đ</b></div>
        </div>

        <div className="flex justify-between">
          <button className="btn-back" onClick={()=>nav('/booking/combos',{ state })}>Quay lại</button>
          <button className="btn-next" onClick={()=>nav('/booking/confirm',{ state:{ ...state, method, ticketTotal: seatSummary.ticketTotal, comboTotal, grandTotal }})}>Thanh toán (mock)</button>
        </div>
      </div>
    </div>
  )
}
