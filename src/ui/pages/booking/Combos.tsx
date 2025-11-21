import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/backendApi'
import BookingBreadcrumb from '../../components/BookingBreadcrumb'
import Countdown from '../../components/Countdown'
import LoadingOverlay from '../../components/LoadingOverlay'

interface ComboItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
  items?: string[]; 
}

export default function Combos(){
  const nav = useNavigate()
  const { state } = useLocation() as any
  
  const [items, setItems] = React.useState<ComboItem[]>([])
  // Lấy danh sách ghế đã chọn từ trang trước
  const selectedSeats: string[] = (state?.selected||[])

  // Khởi tạo qty từ state?.qty nếu có
  const [qty, setQty] = React.useState<Record<string,number>>(state?.qty || {})
  
  const [show, setShow] = React.useState<any>(null)
  const [movie, setMovie] = React.useState<any>(null)
  const [theater, setTheater] = React.useState<any>(null)
  
  const [loading, setLoading] = React.useState(true)

  React.useEffect(()=>{ 
    setLoading(true)
    api.listCombos()
      .then((data: any) => {
        if (data && data.combos) {
          setItems(data.combos)
        } else if (Array.isArray(data)) {
          setItems(data)
        }
      })
      .catch(err => console.error("Lỗi tải danh sách combo:", err))
      .finally(() => setLoading(false))
  },[])

  React.useEffect(()=>{
    const sid = state?.id
    if (!sid) return

    api.getShowtime(String(sid)).then(async (s:any)=>{
      setShow(s)
      if (s?.movieId) {
        const m = await api.getMovie(String(s.movieId))
        setMovie(m)
      }

      const thData = await api.listTheaters()
      let theaterList: any[] = []
      if (Array.isArray(thData)) {
        theaterList = thData
      } else if (thData && thData.cinemas) {
        theaterList = thData.cinemas
      }

      const foundTheater = theaterList.find((t:any) => 
        String(t._id || t.id) === String(s?.theaterId)
      )
      setTheater(foundTheater)
    }).catch(err => console.error("Lỗi lấy thông tin vé:", err))
  },[state?.id])

  const comboTotal = Object.entries(qty).reduce((s,[id,n])=> {
    const item = items.find(i => i._id === id)
    return s + (item?.price || 0) * n
  }, 0)

  // --- Logic tính ghế ---
  const basePrice = show?.price || 0
  const couplePrice = basePrice * 2 + 10000
  const aisleCols = [7]
  const coupleRow = 'H'
  const seatSummary = React.useMemo(()=>{
    const set = new Set(selectedSeats)
    let singles = 0, couples = 0
    const singleIds:string[] = []
    const couplePairLabels:string[] = []
    selectedSeats.forEach(id => {
      const row = id[0]
      const col = parseInt(id.slice(1), 10)
      if (row === coupleRow){
        if (col % 2 === 0) return 
        const nextCol = col + 1
        if (aisleCols.includes(nextCol)){
          singles += 1
          singleIds.push(id)
          return
        }
        const pairIds = [`${row}${col}`, `${row}${nextCol}`]
        if (pairIds.every(sid => set.has(sid))){
          couples += 1
          const pairIndex = Math.ceil(col/2)
          couplePairLabels.push(`H${pairIndex}`)
        } else {
          singles += 1
          singleIds.push(id)
        }
      } else {
        singles += 1
        singleIds.push(id)
      }
    })
    const total = singles * basePrice + couples * couplePrice
    const seatCount = singles + couples * 2
    return { singles, couples, singleIds, couplePairLabels, total, seatCount }
  }, [selectedSeats, basePrice, couplePrice])
  
  const ticketTotal = seatSummary.total
  const grandTotal = ticketTotal + comboTotal

  const formatVNDate = (iso?:string)=>{
    if(!iso) return ''
    const d = new Date(iso)
    const days = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy']
    const dow = days[d.getDay()]
    const hh = d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false})
    const dd = String(d.getDate()).padStart(2,'0')
    const mm = String(d.getMonth()+1).padStart(2,'0')
    const yyyy = d.getFullYear()
    return `${hh} - ${dow}, ${dd}/${mm}/${yyyy}`
  }

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Đang tải danh sách combo..." />
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-3"><BookingBreadcrumb currentStep="combos"/></div>

      <div className="md:col-span-2 card">
        <div className="mb-3 text-xl font-semibold">Chọn Combo / Sản phẩm</div>
        <div className="space-y-3">
          {items.map(cb => (
            <div key={cb._id} className="flex items-center justify-between gap-6 rounded-xl border p-4 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <img
                  src={cb.imageUrl || 'https://picsum.photos/seed/combo-placeholder/100/100'}
                  alt={cb.name}
                  className="w-20 h-20 rounded-md object-cover"
                />
                <div>
                  <div className="text-base font-semibold">{cb.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {cb.description || (cb.items && cb.items.join(', '))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-28 text-right font-medium">{cb.price.toLocaleString()} đ</span>
                <div className="flex items-center gap-3">
                  <button 
                    className="btn-outline text-lg px-3" 
                    onClick={()=> setQty(q => ({...q, [cb._id]: Math.max(0,(q[cb._id]||0)-1)}))}
                  >-</button>
                  <span className="min-w-6 text-center font-semibold">{qty[cb._id]||0}</span>
                  <button 
                    className="btn-outline text-lg px-3" 
                    onClick={()=> setQty(q => ({...q, [cb._id]: (q[cb._id]||0)+1}))}
                  >+</button>
                </div>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Không có combo nào đang mở bán.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Thời gian giữ ghế:</div>
            <Countdown secondsLeft={420} onExpire={()=>nav('/movies')} />
          </div>

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
            <div className="text-gray-600">{theater?.name||'—'}</div>
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

          <div className="pt-2 mt-2 text-base space-y-3">
            <hr className="my-3 border-t border-dashed border-gray-300 dark:border-gray-700" />
            
            {Object.entries(qty).filter(([_,n])=> (n||0)>0).map(([id,n])=>{
              const cb = items.find(i=>i._id===id)
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
        </div>

        <div className="flex justify-between">
          <button
            className="btn-back"
            onClick={()=>{
              const sid = state?.id
              // [CHANGE]: Truyền lại selectedSeats khi quay lại để Seats.tsx biết
              if (sid) nav(`/booking/seats/${sid}`, { state: { selected: selectedSeats } })
              else nav('/booking/select')
            }}
          >Quay lại</button>
          <button 
            className="btn-next" 
            onClick={()=>nav('/booking/payment',{ state:{ ...state, qty, ticketTotal, comboTotal, grandTotal }})}
          >Tiếp tục</button>
        </div>
      </div>
    </div>
  )
}
