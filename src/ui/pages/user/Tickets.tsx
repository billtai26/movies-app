import React from 'react'
import { api } from '../../../lib/api'
import { useAuth } from '../../../store/auth'
import QRCode from 'qrcode.react'

export default function Tickets(){
  const { token, _id, userId } = useAuth()
  const [rows, setRows] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [page, setPage] = React.useState(1)
  const PAGE_SIZE = 5
  const [serverTotalPages, setServerTotalPages] = React.useState<number | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [selected, setSelected] = React.useState<any | null>(null)

  const normalize = (t:any) => {
  const id = t?._id || t?.id
  const code = t?.code || t?.ticketCode || t?.qrCode || id || ''
  const movie = t?.movie?.title || t?.movieTitle || t?.movie || ''
  
  // --- SỬA ĐOẠN NÀY ---
  // Kiểm tra kỹ: nếu phần tử là object thì lấy .name, nếu là string thì giữ nguyên
  // --- SỬA LẠI ĐOẠN NÀY ---
    const seats = Array.isArray(t?.seats) 
      ? t.seats.map((s: any) => {
          if (typeof s === 'object' && s !== null) {
            // 1. Ưu tiên cấu trúc row/number từ bookingModel (ví dụ: {row: 'A', number: 1} -> 'A1')
            if (s.row && s.number) {
                return `${s.row}${s.number}`;
            }
            // 2. Các trường hợp dự phòng khác
            return s.seatNumber || s.name || s.code || s.label || 'Ghế';
          }
          return s;
        })
      : (typeof t?.seats === 'string' ? t.seats.split(',').map((s:string)=>s.trim()).filter(Boolean) : [])
    // -------------------------
    const theater = t?.cinema?.name || t?.theater?.name || t?.cinema || t?.theater || ''
    const room = t?.room?.name || t?.room || ''
    const startTime = t?.startTime || t?.showtime?.startTime || t?.time || null
    const total = t?.totalAmount || t?.total || t?.price || null
    const status = t?.status || 'done'
    const createdAt = t?.createdAt || null
    const ticketUserId = t?.user?._id || t?.user?.id || t?.user || t?.userId || null
    return { id, code, movie, seats, theater, room, startTime, total, status, createdAt, ticketUserId, raw: t }
  }

  React.useEffect(()=>{
    setLoading(true)
    setError('')
    api.listMyTickets({ page: 1, limit: 1000 })
      .then((res:any)=>{
        const arr = res?.tickets || res?.orders || res?.data || res || []
        let list = Array.isArray(arr) ? arr.map(normalize) : []
        
        // Lọc vé của user hiện tại (nếu backend trả về tất cả vé)
        const currentUserId = _id || userId
        if (currentUserId) {
          list = list.filter(t => String(t.ticketUserId) === String(currentUserId))
        }
        
        setRows(list)
        const tp = Math.ceil(list.length / PAGE_SIZE)
        setServerTotalPages(tp)
        if (selectedId){
          const found = list.find(x=> String(x.id)===String(selectedId)) || null
          setSelected(found)
        }
      })
      .catch((e:any)=>{ setError(e?.response?.data?.message || e?.message || 'Lỗi tải vé') })
      .finally(()=> setLoading(false))
  },[_id, userId])

  const totalPages = serverTotalPages ?? Math.max(1, (Array.isArray(rows) ? Math.ceil(rows.length / PAGE_SIZE) : 1))
  const start = (page-1) * PAGE_SIZE
  const visible = rows.slice(start, start + PAGE_SIZE)

  const handleOpen = async (id:string)=>{
    setSelectedId(id)
    setSelected(rows.find(r=> String(r.id)===String(id)) || null)
    try{
      const data:any = await api.getMyTicket(id)
      const t = normalize(data)
      setSelected(t)
    }catch{}
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Vé của tôi</h2>
      {loading ? (
        <div className="card">Đang tải...</div>
      ) : error ? (
        <div className="card text-red-600 text-sm">{error}</div>
      ) : (
        <div className="space-y-3">
          {visible.map(t=> (
            <div key={t.id} className="card p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{t.movie || 'Vé phim'}</div>
                  <div className="text-xs text-gray-600">{t.theater}{t.room?` - ${t.room}`:''}</div>
                  <div className="text-xs text-gray-600">Ghế: {t.seats?.join(', ') || '...'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{t.total!=null ? `${Number(t.total).toLocaleString()} đ` : ''}</div>
                  <button className="mt-1 px-3 py-1 border rounded text-xs" onClick={()=> handleOpen(String(t.id))}>Xem chi tiết</button>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">Trang {page}/{totalPages}</div>
            <div className="flex gap-2">
              <button className={`px-2 py-1 border rounded text-xs ${page<=1?'opacity-50 cursor-not-allowed':''}`} disabled={page<=1} onClick={()=> setPage(p=> Math.max(1, p-1))}>Trước</button>
              <button className={`px-2 py-1 border rounded text-xs ${page>=totalPages?'opacity-50 cursor-not-allowed':''}`} disabled={page>=totalPages} onClick={()=> setPage(p=> Math.min(totalPages, p+1))}>Sau</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="card p-4 space-y-3">
          <div className="font-semibold">Chi tiết vé</div>
          <div className="flex items-center gap-4">
            <QRCode value={JSON.stringify({ type:'ticket', id: selected.id, code: selected.code })} size={120}/>
            <div className="text-sm text-gray-700 space-y-1">
              <div>Mã: {selected.code || selected.id}</div>
              <div>Phim: {selected.movie}</div>
              <div>Rạp: {selected.theater}{selected.room?` - ${selected.room}`:''}</div>
              <div>Suất: {selected.startTime ? new Date(selected.startTime).toLocaleString() : '...'}</div>
              <div>Ghế: {selected.seats?.join(', ') || '...'}</div>
              <div>Tổng tiền: {selected.total != null ? `${Number(selected.total).toLocaleString()} đ` : '...'}</div>
              <div>Trạng thái: {selected.status}</div>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="px-3 py-1 border rounded text-xs" onClick={()=> setSelected(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  )
}
