import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingBreadcrumb from '../../components/BookingBreadcrumb'
import { api } from "../../../lib/api"; // Đảm bảo đường dẫn này đúng

export default function Payment(){
  const nav = useNavigate()
  const { state } = useLocation() as any
  const [method, setMethod] = React.useState('momo')
  const [show, setShow] = React.useState<any>(null)
  const [movie, setMovie] = React.useState<any>(null)
  const [theater, setTheater] = React.useState<any>(null)
  const [room, setRoom] = React.useState<any>(null)
  const [items, setItems] = React.useState<any[]>([])

  const [voucherCode, setVoucherCode] = useState(""); // Lưu mã từ input
  const [isLoading, setIsLoading] = useState(false); // Trạng thái chờ API
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Báo lỗi
  const [discountInfo, setDiscountInfo] = useState<{
    discountAmount: number;
    finalAmount: number;
    message: string;
  } | null>(null); // Lưu kết quả giảm giá thành công

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
  const basePrice = show?.price ?? 80000
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

  // --- SỬA TÍNH TOÁN TỔNG TIỀN ---
  // Đổi tên 'grandTotal' thành 'originalTotal' để rõ ràng
  const originalTotal = seatSummary.ticketTotal + comboTotal
  
  // Tính toán tổng tiền cuối cùng dựa trên thông tin giảm giá
  const finalTotal = discountInfo ? discountInfo.finalAmount : originalTotal;
  const discountAmount = discountInfo ? discountInfo.discountAmount : 0;
  // --- KẾT THÚC SỬA ---

  // --- THÊM HÀM XỬ LÝ VOUCHER ---
  const handleApplyVoucher = async () => {
    if (!voucherCode) {
      setErrorMessage("Vui lòng nhập mã voucher.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setDiscountInfo(null); // Xóa thông tin giảm giá cũ (nếu có)

    try {
      // Gọi API với mã voucher và tổng tiền GỐC
      const data = await api.applyVoucher(voucherCode, originalTotal);
      
      // API thành công, lưu kết quả
      setDiscountInfo(data);

    } catch (err: any) {
      // Xử lý lỗi từ API (ví dụ: mã hết hạn, không hợp lệ, không đủ ĐK)
      const msg = err.response?.data?.message || "Mã voucher không hợp lệ hoặc đã hết hạn.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-3"><BookingBreadcrumb currentStep="payment"/></div>

      {/* Cột trái: Khuyến mãi + phương thức thanh toán */}
      <div className="md:col-span-2 space-y-4">
        
        {/* --- SỬA KHUNG KHUYẾN MÃI --- */}
        <div className="card space-y-3">
          <div className="text-base font-semibold">Khuyến mãi</div>
          <div className="flex gap-2">
            <input 
              className="input flex-1" 
              placeholder="Mã khuyến mãi" 
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} // Tự động viết hoa
              disabled={!!discountInfo} // Vô hiệu hóa nếu đã áp dụng
            />
            <button 
              className="btn-outline" 
              onClick={handleApplyVoucher}
              disabled={isLoading || !!discountInfo} // Vô hiệu hóa khi đang tải hoặc đã áp dụng
            >
              {isLoading ? "Đang..." : "Áp dụng"}
            </button>
          </div>
          {/* Hiển thị thông báo Lỗi (nếu có) */}
          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
          
          {/* Hiển thị thông báo Thành công (nếu có) */}
          {discountInfo && (
            <p className="text-sm text-green-600">{discountInfo.message}</p>
          )}
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
          {/* --- SỬA HIỂN THỊ TỔNG TIỀN --- */}
          {/* Hiển thị Tạm tính và Giảm giá CHỈ KHI đã áp dụng voucher */}
          {discountInfo && (
            <>
              <hr className="my-3 border-t border-dashed border-gray-300 dark:border-gray-700" />
              <div className="flex items-center justify-between text-base">
                <span>Tạm tính</span>
                <b className="text-lg">{originalTotal.toLocaleString()} đ</b>
              </div>
              <div className="flex items-center justify-between text-base text-green-600">
                <span>Giảm giá</span>
                <b className="text-lg">- {discountAmount.toLocaleString()} đ</b>
              </div>
            </>
          )}

          {/* Dòng này luôn hiển thị tổng tiền CUỐI CÙNG */}
          <hr className="my-3 border-t border-dashed border-gray-300 dark:border-gray-700" />
          <div className="flex items-center justify-between text-xl font-bold">
            <span>Tổng cộng</span>
            {/* SỬA: Hiển thị 'finalTotal' thay vì 'grandTotal' */}
            <b className="text-2xl text-orange-600">{finalTotal.toLocaleString()} đ</b>
          </div>
          {/* --- KẾT THÚC SỬA TỔNG TIỀN --- */}
        </div>

        <div className="flex justify-between">
          <button className="btn-back" onClick={()=>nav('/booking/combos',{ state })}>Quay lại</button>
          
          {/* --- SỬA NÚT THANH TOÁN --- */}
          {/* Gửi 'finalTotal' (là grandTotal) và 'discountAmount' sang trang confirm */}
          <button 
            className="btn-next" 
            onClick={()=>nav('/booking/confirm',{ 
              state:{ 
                ...state, 
                method, 
                ticketTotal: seatSummary.ticketTotal, 
                comboTotal, 
                originalTotal: originalTotal,
                discountAmount: discountAmount,
                grandTotal: finalTotal // Trang confirm sẽ nhận 'grandTotal' là số tiền cuối cùng
              }
            })}
          >
            Thanh toán (mock)
          </button>
          {/* --- KẾT THÚC SỬA NÚT --- */}
        </div>
      </div>
    </div>
  )
}
