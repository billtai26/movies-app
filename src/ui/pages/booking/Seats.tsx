
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/mockApi'
import SeatMap from '../../components/SeatMap'
import BookingBreadcrumb from '../../components/BookingBreadcrumb'
// Countdown sẽ chỉ hiển thị ở trang Combos theo yêu cầu người dùng

export default function Seats(){
  const { id } = useParams()
  const nav = useNavigate()
  const [st, setSt] = React.useState<any>(null)
  const [movie, setMovie] = React.useState<any>(null)
  const [theater, setTheater] = React.useState<any>(null)
  const [room, setRoom] = React.useState<any>(null)
  const [selected, setSelected] = React.useState<string[]>([])
  const [selectedTime, setSelectedTime] = React.useState<string>('')
  const [availableTimes, setAvailableTimes] = React.useState<string[]>([])
  const [availableShows, setAvailableShows] = React.useState<any[]>([])
  const [limitOpen, setLimitOpen] = React.useState(false)
  const [needSelectOpen, setNeedSelectOpen] = React.useState(false)
  React.useEffect(()=>{ if(!id) return; api.getShowtime(id).then((s)=>{ setSt(s as any); if(s){ api.getMovie(s.movieId).then(setMovie); api.listTheaters().then(ts=> setTheater(ts.find(t=>t.id===s.theaterId))); api.listRooms().then(rs=> setRoom(rs.find((r:any)=> r.id===s.roomId))) } }) },[id])
  React.useEffect(()=>{
    if (st?.startTime) {
      // Ưu tiên sử dụng trường time để khớp tuyệt đối với dữ liệu suất chiếu
      const hhmm = st?.time || (()=>{ const dt = new Date(st.startTime); return `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}` })()
      setSelectedTime(hhmm)
      // Tải danh sách suất chiếu cùng phim, cùng rạp, cùng ngày để hiển thị đúng và cho phép đổi đúng ID
      ;(async () => {
        const all = await api.listShowtimes()
        const sameDay = (a:string,b:string) => {
          const da = new Date(a), db = new Date(b)
          return da.getFullYear()===db.getFullYear() && da.getMonth()===db.getMonth() && da.getDate()===db.getDate()
        }
        const filtered = all.filter((x:any)=> x.movieId===st.movieId && x.theaterId===st.theaterId && sameDay(x.startTime, st.startTime))
        setAvailableShows(filtered)
        const times = Array.from(new Set(filtered.map((x:any)=> x.time))).sort()
        setAvailableTimes(times.length?times:[hhmm])
      })()
    }
  }, [st])
  const formatDateLabel = (dateStr:string) => {
    const dt = new Date(dateStr)
    const weekdays = ['Chủ nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy']
    const wd = weekdays[dt.getDay()]
    const dd = String(dt.getDate()).padStart(2,'0')
    const mm = String(dt.getMonth()+1).padStart(2,'0')
    const yyyy = dt.getFullYear()
    return `${wd}, ${dd}/${mm}/${yyyy}`
  }
  const timeButtons = availableTimes
  const aisleCols = [7]
  const coupleRows = ["H"]
  const basePrice = st?.price || 0
  const couplePrice = basePrice * 2 + 10000
  const summary = React.useMemo(() => {
    const set = new Set(selected)
    let singles = 0, couples = 0
    const singleIds:string[] = []
    const couplePairLabels:string[] = []
    selected.forEach(id => {
      const row = id[0]
      const col = parseInt(id.slice(1), 10)
       // Couple logic strictly on row H -> pairs H1..H6
       if (row === 'H'){
         if (col % 2 === 0) {
           // even seat counted by its preceding odd seat
           return
         }
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
    return { singles, couples, singleIds, couplePairLabels, total }
  }, [selected, basePrice])
  if(!st) return <div>Đang tải...</div>
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr_400px]">
      <div className="md:col-span-3"><BookingBreadcrumb currentStep="seats"/></div>
      <div className="md:col-span-2 space-y-4">
        <div className="card">
          <div className="mb-2 font-semibold">Đổi suất chiếu</div>
          <div className="flex flex-wrap gap-2">
            {timeButtons.map(t => (
              <button
                key={t}
                className={`px-4 py-1 rounded border text-sm ${selectedTime===t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white hover:bg-gray-50'}`}
                onClick={()=> {
                  setSelectedTime(t)
                  const target = availableShows.find((x:any)=> x.time===t)
                  if (target) nav(`/booking/seats/${target.id}`)
                }}
              >{t}</button>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <div className="max-h-[520px] overflow-y-auto scrollbar-thin">
            <SeatMap rows={8} cols={12} vipRows={["E","F"]} coupleRows={["H"]} aisleCols={[7]} aisleRows={["D","G"]} maxSelected={8} onLimitExceeded={()=>setLimitOpen(true)} onChange={setSelected}/>
          </div>
        </div>
      </div>
      <div className="space-y-4 md:sticky md:top-4">
        <div className="card p-5 space-y-4">
          <div className="flex gap-4">
            <img src={movie?.poster} className="h-48 w-32 rounded-lg object-cover"/>
            <div className="text-base">
              <div className="text-xl font-semibold leading-tight">{movie?.title}</div>
              {movie?.rating!=null && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-700">T{movie.rating}</span>
              )}
            </div>
          </div>
          {/* Đưa thông tin rạp và suất xuống dưới hình như yêu cầu */}
          <div className="mt-2 text-base">
            {theater && (
              <div className="opacity-80">{theater.name} {room?.name ? `- ${room.name}` : ''}</div>
            )}
            <div className="opacity-80">Suất: {(selectedTime || '')} - {formatDateLabel(st.startTime)}</div>
          </div>
          <hr className="border-dashed dark:border-gray-700"/>
          {summary.singles>0 && (
            <div className="flex items-center justify-between">
              <span>{summary.singles}x Ghế đơn</span>
              <b className="text-lg">{(summary.singles*basePrice).toLocaleString()} đ</b>
            </div>
          )}
          {summary.singleIds.length>0 && (
            <div className="text-xs opacity-80">Ghế: {summary.singleIds.join(', ')}</div>
          )}
          {summary.couples>0 && (
            <div className="flex items-center justify-between">
              <span>{summary.couples}x Ghế đôi</span>
              <b className="text-lg">{(summary.couples*couplePrice).toLocaleString()} đ</b>
            </div>
          )}
          {summary.couplePairLabels.length>0 && (
            <div className="text-xs opacity-80">Ghế: {summary.couplePairLabels.join(', ')}</div>
          )}
          {summary.singleIds.length===0 && summary.couplePairLabels.length===0 && (
            <div className="text-xs opacity-60">Ghế: Chưa chọn</div>
          )}
          <hr className="border-dashed dark:border-gray-700"/>
          <div className="flex items-center justify-between mt-2 text-xl font-bold"><span>Tổng cộng</span><b className="text-2xl text-orange-600">{summary.total.toLocaleString()} đ</b></div>
        </div>
        <div className="flex justify-between mt-3">
          <button className="btn-back" onClick={()=>nav('/booking/select')}>Quay lại</button>
          <button
            className="btn-next"
            onClick={()=>{
              if (selected.length===0){
                setNeedSelectOpen(true)
                return
              }
              nav('/booking/combos',{ state:{ id, selected }})
            }}
          >Tiếp tục</button>
        </div>
      </div>
      {/* Modal cảnh báo quá số ghế */}
      {limitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.18)] w-[360px] px-6 pt-5 pb-4 text-center">
            {/* Icon cảnh báo */}
            <div className="mx-auto mb-3 h-10 w-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-10 w-10">
                <path fill="#F59E0B" d="M12 3l9 16H3l9-16z"/>
                <path fill="#fff" d="M12 9c.6 0 1 .4 1 1v4a1 1 0 1 1-2 0v-4c0-.6.4-1 1-1zm0 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
              </svg>
            </div>
            {/* Tiêu đề */}
            <div className="font-semibold text-[16px] mb-1">Thông báo</div>
            {/* Nội dung */}
            <div className="text-[13px] text-gray-700 mb-5">Số lượng ghế tối đa được đặt là 8 ghế</div>
            {/* Nút Đồng ý */}
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10 rounded-md font-medium" onClick={()=>setLimitOpen(false)}>Đồng ý</button>
          </div>
        </div>
      )}
      {/* Modal yêu cầu chọn ghế khi bấm Tiếp tục mà chưa chọn */}
      {needSelectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.18)] w-[360px] px-6 pt-5 pb-4 text-center">
            <div className="mx-auto mb-3 h-10 w-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-10 w-10">
                <path fill="#F59E0B" d="M12 3l9 16H3l9-16z"/>
                <path fill="#fff" d="M12 9c.6 0 1 .4 1 1v4a1 1 0 1 1-2 0v-4c0-.6.4-1 1-1zm0 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
              </svg>
            </div>
            <div className="font-semibold text-[16px] mb-1">Thông báo</div>
            <div className="text-[13px] text-gray-700 mb-5">Vui lòng chọn ghế</div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10 rounded-md font-medium" onClick={()=>setNeedSelectOpen(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  )
}
