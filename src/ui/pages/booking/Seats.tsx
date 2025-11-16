import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// Giả sử bạn dùng socket.io-client
import { io, Socket } from 'socket.io-client' 
// Giả sử bạn có file api/index.ts (hoặc mockApi) để gọi API
import { api } from '../../../lib/api' 
import SeatMap from '../../components/SeatMap'
import BookingBreadcrumb from '../../components/BookingBreadcrumb'
import Countdown from '../../components/Countdown' // Component đã sửa
import { useAuth } from '../../../store/auth' // Import store auth

// --- Định nghĩa kiểu dữ liệu ---
type SeatState = 'empty' | 'held' | 'booked' | 'selected'
type Seat = {
  id: string, 
  row: string, 
  col: number, 
  type: 'normal' | 'vip' | 'couple', 
  state: SeatState,
  userId?: string // Thêm userId để biết AI đang giữ
}

// === CÀI ĐẶT TIMER ===
const HOLD_DURATION_SECONDS = 420; // 7 phút (Tổng thời gian giữ ghế)

export default function Seats(){
  // 1. HOOKS & STATE CƠ BẢN
  const { id: showtimeId } = useParams()
  const nav = useNavigate()
  
  // Lấy userId thật từ store auth
  const { email: myUserId } = useAuth(); // Dùng email hoặc ID nếu có

  // State cho dữ liệu (suất chiếu, phim, rạp...)
  const [st, setSt] = React.useState<any>(null)
  const [movie, setMovie] = React.useState<any>(null)
  const [theater, setTheater] = React.useState<any>(null)
  const [room, setRoom] = React.useState<any>(null)

  // State quản lý danh sách ghế (nguồn dữ liệu chính)
  const [seats, setSeats] = useState<Seat[]>([])
  
  // State quản lý kết nối WebSocket
  const [socket, setSocket] = useState<Socket | null>(null)

  // State cho UI (thời gian, modal...)
  const [selectedTime, setSelectedTime] = React.useState<string>('')
  const [availableTimes, setAvailableTimes] = React.useState<string[]>([])
  const [availableShows, setAvailableShows] = React.useState<any[]>([])
  const [limitOpen, setLimitOpen] = React.useState(false)
  const [needSelectOpen, setNeedSelectOpen] = React.useState(false)

  // === STATE MỚI CHO TIMER ===
  const [secondsLeft, setSecondsLeft] = useState(HOLD_DURATION_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 2. LOGIC LOAD DỮ LIỆU BAN ĐẦU (API)
  useEffect(() => {
    if (!showtimeId) return;

    // (Giữ nguyên logic fetch API của bạn)
    api.getShowtime(showtimeId).then((showtimeDetails) => {
      setSt(showtimeDetails as any);

      // Chuyển đổi seats từ định dạng backend về Seat[] cho SeatMap
      if (showtimeDetails && Array.isArray(showtimeDetails.seats)) {
        const toSeat = (sn:string, status:string, heldBy?:string): Seat => {
          const row = sn.replace(/\d+/,'')
          const colStr = sn.replace(/\D+/,'')
          const col = Number(colStr)
          const state: SeatState = status === 'booked' ? 'booked' : (heldBy ? 'held' : 'empty')
          return { id: sn, row, col, type: 'normal', state, userId: heldBy || undefined }
        }
        const converted: Seat[] = showtimeDetails.seats.map((s:any)=> toSeat(s.seatNumber, s.status, s.heldBy))
        setSeats(converted)
      } else {
        console.error("API không trả về 'seats'.");
        setSeats([]); 
      }

      // Các logic fetch thông tin liên quan
      if (showtimeDetails) {
        api.getMovie(showtimeDetails.movieId).then(setMovie);
        api.listTheaters().then(ts => setTheater(ts.find((t: any) => (t.id || t._id) === (showtimeDetails.theaterId || showtimeDetails.cinemaId))));
        api.listRooms().then(rs => setRoom(rs.find((r: any) => (r.id || r._id) === showtimeDetails.roomId)));
      }

    }).catch(err => {
      console.error("Lỗi khi lấy chi tiết suất chiếu:", err);
      setSt(null);
      setSeats([]);
    });

  }, [showtimeId])

  // Effect để cập nhật danh sách giờ chiếu (giữ nguyên)
  useEffect(()=>{
    const parseIsoWall = (iso?:string)=>{
      if(!iso) return null; const m = (iso as string).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/); if(m) return {dd:m[3],mm:m[2],hh:m[4],min:m[5]}; const d=new Date(iso as string); return {dd:String(d.getDate()).padStart(2,'0'), mm:String(d.getMonth()+1).padStart(2,'0'), hh:String(d.getHours()).padStart(2,'0'), min:String(d.getMinutes()).padStart(2,'0')}; }
    if (st?.startTime) {
      const base = parseIsoWall(st.startTime)!; const hhmm = `${base.hh}:${base.min}`
      setSelectedTime(hhmm)
      ;(async () => {
        const all = await api.listShowtimes()
        const dayMM = (iso:string)=>{ const p=parseIsoWall(iso)!; return `${p.dd}/${p.mm}` }
        const filtered = all.filter((x:any)=> x.movieId===st.movieId && ((x.theaterId===st.theaterId) || (x.cinemaId===st.theaterId) || (x.theaterId===st.cinemaId) || (x.cinemaId===st.cinemaId)) && dayMM(x.startTime)===dayMM(st.startTime))
        setAvailableShows(filtered)
        const toHHmm = (iso?:string)=>{ if(!iso) return null; const p=parseIsoWall(iso)!; return `${p.hh}:${p.min}` }
        const times = Array.from(new Set(filtered.map((x:any)=> x.time || toHHmm(x.startTime)).filter(Boolean))) as string[]
        setAvailableTimes(times.length?times:[hhmm])
        })()
      }
  }, [st])

  // 3. LOGIC KẾT NỐI WEBSOCKET
  useEffect(() => {
    if (!showtimeId || !myUserId) return;

    // 1. Khởi tạo kết nối
    const newSocket = io("http://localhost:4000"); // Trỏ đến server BE của bạn
    setSocket(newSocket);

    // 2. Tham gia "phòng"
    newSocket.on('connect', () => {
      console.log('Socket.IO đã kết nối, id:', newSocket.id);
      newSocket.emit('join_room', showtimeId);
    });

    // 3. Lắng nghe cập nhật ghế (từ người khác)
    newSocket.on('seat:updated', (updatedSeat: Seat) => {
      console.log('Nhận cập nhật ghế:', updatedSeat);
      setSeats(prevSeats => 
        prevSeats.map(s => {
          if (s.id !== updatedSeat.id) return s;
          
          // Xử lý logic nếu người khác giữ (held) hoặc chọn (selected)
          // Giả định BE gửi 'held' nếu người khác giữ
          if (updatedSeat.state === 'held' && updatedSeat.userId !== myUserId) {
             return { ...updatedSeat, state: 'held' };
          }
          // Nếu ghế được cập nhật là của mình (ví dụ: được BE xác nhận)
          return updatedSeat;
        })
      );
    });

    // 4. Lắng nghe sự kiện khi ghế đã được thanh toán
    newSocket.on('seats:booked', (bookedSeatIds: string[]) => {
      console.log('Ghế đã được thanh toán:', bookedSeatIds);
      setSeats(prevSeats => 
        prevSeats.map(s => 
          bookedSeatIds.includes(s.id) ? { ...s, state: 'booked' } : s
        )
      );
    });

    // 5. Dọn dẹp (cleanup)
    return () => {
      console.log('Ngắt kết nối Socket.IO');
      newSocket.emit('leave_room', showtimeId);
      newSocket.disconnect();
    };
  }, [showtimeId, myUserId]); // Chạy lại khi đổi suất chiếu hoặc user

  // 4. HÀM XỬ LÝ SỰ KIỆN TOGGLE (gọi từ SeatMap)
  const mySelectedSeats = useMemo(() => {
    // Ưu tiên lọc theo userId nếu BE trả về
    if (seats.some(s => s.userId)) {
      return seats.filter(s => s.state === 'selected' && s.userId === myUserId);
    }
    // Fallback: nếu không có userId, coi tất cả 'selected' là của mình
    return seats.filter(s => s.state === 'selected');
  }, [seats, myUserId]);
  
  const mySelectedSeatIds = useMemo(() => mySelectedSeats.map(s => s.id), [mySelectedSeats]);

  // Hàm gọi BE để hủy TẤT CẢ các ghế đang giữ
  const releaseAllMySeats = (notifyUser = true) => {
    if (!socket || mySelectedSeatIds.length === 0) return;

    console.log(`CLIENT: Tự động hủy ${mySelectedSeatIds.length} ghế...`);
    
    // Gửi 1 sự kiện duy nhất lên BE
    socket.emit('seat:release_many', { 
      showtimeId, 
      seatIds: mySelectedSeatIds, 
      userId: myUserId 
    });

    // Cập nhật UI ngay lập tức
    setSeats(prev => 
      prev.map(s => 
        mySelectedSeatIds.includes(s.id) ? { ...s, state: 'empty', userId: undefined } : s
      )
    );
    
    if (notifyUser) {
      alert("Đã hết thời gian giữ ghế. Vui lòng chọn lại.");
    }
  };

  // === 5. LOGIC TIMER CHÍNH (ĐÃ BỎ GIA HẠN) ===
  useEffect(() => {
    // Chỉ chạy timer nếu đang giữ ít nhất 1 ghế
    if (mySelectedSeats.length > 0) {
      if (!timerRef.current) {
        console.log("CLIENT: Bắt đầu timer giữ ghế...");
        timerRef.current = setInterval(() => {
          setSecondsLeft(prevSeconds => {
            
            // Logic HỦY (Khi còn 0 giây)
            if (prevSeconds <= 1) {
              clearInterval(timerRef.current!);
              timerRef.current = null;
              releaseAllMySeats(true); // Hủy ghế và thông báo
              nav('/movies'); // Về trang chủ
              return 0;
            }
            
            // Logic GIA HẠN (ĐÃ BỎ)
            
            // Đếm ngược bình thường
            return prevSeconds - 1;
          });
        }, 1000);
      }
    } else {
      // Nếu không còn giữ ghế nào (đã tự tay bỏ chọn hết)
      if (timerRef.current) {
        console.log("CLIENT: Không còn ghế, dừng timer.");
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Reset thời gian
      setSecondsLeft(HOLD_DURATION_SECONDS);
    }

    // Cleanup: Dọn dẹp timer khi component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mySelectedSeats.length, socket, showtimeId, nav]); // Phụ thuộc vào số ghế đang giữ

  // === 6. XỬ LÝ KHI RỜI TRANG (QUAN TRỌNG) ===
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Hàm này sẽ được gọi khi người dùng đóng tab/trình duyệt
      releaseAllMySeats(false); // Hủy mà không thông báo
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Cũng hủy ghế khi component unmount (ví dụ: bấm Back, điều hướng)
      // Chúng ta cần kiểm tra xem có phải đang điều hướng đến trang tiếp theo không
      // Tạm thời, chúng ta sẽ dựa vào logic của nút "Tiếp tục"
      // releaseAllMySeats(false); // Tạm thời vô hiệu hóa để tránh hủy khi bấm "Tiếp tục"
    };
  }, [socket, mySelectedSeatIds]); // Cần [mySelectedSeatIds] để hàm releaseAllMySeats luôn lấy được ds ghế mới nhất

  // 7. HÀM XỬ LÝ CLICK CHỌN GHẾ
  const handleToggle = (seatId: string) => {
    if (!socket || !myUserId) return; // Chưa kết nối socket hoặc chưa có user

    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.state === 'booked' || (seat.state === 'held' && seat.userId !== myUserId)) return;

    if (seat.state === 'empty') {
      // Kiểm tra giới hạn
      if (mySelectedSeats.length >= 8) { // Giả sử maxSelected = 8
        setLimitOpen(true);
        return;
      }
      // Optimistic update (cập nhật UI ngay lập tức)
      setSeats(prev => prev.map(s => s.id === seatId ? {...s, state: 'selected', userId: myUserId} : s));
      // Gửi sự kiện lên server
      socket.emit('seat:hold', { showtimeId, seatId, userId: myUserId });
    
    } else if (seat.state === 'selected') {
      // Optimistic update
      setSeats(prev => prev.map(s => s.id === seatId ? {...s, state: 'empty', userId: undefined} : s));
      // Gửi sự kiện lên server
      socket.emit('seat:release', { showtimeId, seatId, userId: myUserId });
    }
  };

  const handleToggleMany = (seatIds: string[]) => {
    if (!socket || !myUserId) return;
    
    const seatsToToggle = seats.filter(s => seatIds.includes(s.id));
    if (seatsToToggle.some(s => s.state === 'booked' || (s.state === 'held' && s.userId !== myUserId))) return;

    // Kiểm tra xem đang chọn hay bỏ chọn
    const isSelecting = seatsToToggle.some(s => s.state === 'empty');
    
    if (isSelecting) {
      // Kiểm tra giới hạn
      const newSeatsCount = seatsToToggle.filter(s => s.state === 'empty').length;
      if (mySelectedSeats.length + newSeatsCount > 8) { // Giả sử maxSelected = 8
        setLimitOpen(true);
        return;
      }
      // Optimistic update (chọn tất cả ghế hợp lệ)
      setSeats(prev => prev.map(s => seatIds.includes(s.id) && s.state === 'empty' ? {...s, state: 'selected', userId: myUserId} : s));
      // Gửi sự kiện
      seatIds.forEach(seatId => {
        if (seats.find(s => s.id === seatId)?.state === 'empty') {
          socket.emit('seat:hold', { showtimeId, seatId, userId: myUserId });
        }
      });

    } else {
      // Bỏ chọn (tất cả đều đang 'selected')
      setSeats(prev => prev.map(s => seatIds.includes(s.id) && s.state === 'selected' ? {...s, state: 'empty', userId: undefined} : s));
      // Gửi sự kiện
      seatIds.forEach(seatId => {
        socket.emit('seat:release', { showtimeId, seatId, userId: myUserId });
      });
    }
  };

  // 8. LOGIC TÍNH TOÁN (giữ nguyên)
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
  const basePrice = st?.price || 0
  const couplePrice = basePrice * 2 + 10000

  // 'selected' giờ là state 'mySelectedSeats' đã tính ở trên
  const summary = React.useMemo(() => {
    const set = new Set(mySelectedSeatIds);
    let singles = 0, couples = 0
    const singleIds:string[] = []
    const couplePairLabels:string[] = []
    
    mySelectedSeats.forEach(seat => {
      const { id, row, col } = seat;
       if (row === 'H'){ // Giả định hàng H là ghế đôi
         if (col % 2 === 0) {
           return // Ghế chẵn được tính bởi ghế lẻ
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
  }, [mySelectedSeats, mySelectedSeatIds, basePrice, couplePrice]) // Phụ thuộc vào mySelectedSeats

  // 9. LOADING STATE
  if (!st || !seats.length) {
    return (
      <div className="flex items-center justify-center w-full h-96"> 
        <div role="status">
          <svg aria-hidden="true" className="w-8 h-8 text-neutral-tertiary animate-spin fill-brand" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span className="sr-only">Loading...</span> 
        </div>
      </div>
    );
  }

  // 10. RENDER
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr_400px]">
      <div className="md:col-span-3"><BookingBreadcrumb currentStep="seats"/></div>
      
      {/* Cột trái - Sơ đồ ghế */}
      <div className="md:col-span-2 space-y-4">
        {/* Đổi suất chiếu */}
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
                  // Điều hướng đến ID suất chiếu mới
                  if (target && target.id !== showtimeId) nav(`/booking/seats/${target.id}`)
                }}
              >{t}</button>
            ))}
          </div>
        </div>
        {/* Component SeatMap đã refactor */}
        <div className="card p-4">
          <div className="max-h-[520px] overflow-y-auto scrollbar-thin">
            <SeatMap 
              seats={seats} // <-- Truyền mảng ghế
              aisleCols={[7]}
              aisleRows={["D","G"]}
              maxSelected={8} // <-- Quản lý ở component cha
              onLimitExceeded={() => setLimitOpen(true)}
              onToggle={handleToggle} // <-- Truyền hàm xử lý
              onToggleMany={handleToggleMany} // <-- Truyền hàm xử lý
            />
          </div>
        </div>
      </div>
      
      {/* Cột phải - Tóm tắt */}
      <div className="space-y-4 md:sticky md:top-4">
        <div className="card p-5 space-y-4">
          
          {/* Component Countdown mới */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Thời gian giữ ghế:</div>
            <Countdown secondsLeft={secondsLeft} /> 
          </div>

          {/* Thông tin phim */}
          <div className="flex gap-4">
            <img src={movie?.poster} className="h-48 w-32 rounded-lg object-cover"/>
            <div className="text-base">
              <div className="text-xl font-semibold leading-tight">{movie?.title}</div>
              {movie?.rating!=null && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-700">T{movie.rating}</span>
              )}
            </div>
          </div>
          {/* Thông tin rạp/suất */}
          <div className="mt-2 text-base">
            {theater && (
              <div className="opacity-80">{theater.name} {room?.name ? `- ${room.name}` : ''}</div>
            )}
            <div className="opacity-80">Suất: {(selectedTime || '')} - {formatDateLabel(st.startTime)}</div>
          </div>
          <hr className="border-dashed dark:border-gray-700"/>
          
          {/* Tóm tắt vé */}
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
          {mySelectedSeats.length === 0 && (
            <div className="text-xs opacity-60">Ghế: Chưa chọn</div>
          )}
          <hr className="border-dashed dark:border-gray-700"/>
          
          {/* Tổng cộng */}
          <div className="flex items-center justify-between mt-2 text-xl font-bold"><span>Tổng cộng</span><b className="text-2xl text-orange-600">{summary.total.toLocaleString()} đ</b></div>
        </div>
        
        {/* Nút điều hướng */}
        <div className="flex justify-between mt-3">
          <button className="btn-back" onClick={()=>nav('/booking/select')}>Quay lại</button>
          <button
            className="btn-next"
            onClick={()=>{
              if (mySelectedSeats.length === 0){
                setNeedSelectOpen(true)
                return
              }
              // Khi bấm "Tiếp tục", chúng ta *không* hủy ghế
              // Logic cleanup trong useEffect(..., [socket, mySelectedSeatIds]) sẽ lo việc này
              // nếu người dùng rời trang bằng cách khác.
              nav('/booking/combos',{ state:{ id: showtimeId, selected: mySelectedSeatIds }})
            }}
          >Tiếp tục</button>
        </div>
      </div>

      {/* Các Modal (giữ nguyên) */}
      {limitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
           <div className="bg-white rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.18)] w-[360px] px-6 pt-5 pb-4 text-center">
            <div className="mx-auto mb-3 h-10 w-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-10 w-10">
                <path fill="#F59E0B" d="M12 3l9 16H3l9-16z"/>
                <path fill="#fff" d="M12 9c.6 0 1 .4 1 1v4a1 1 0 1 1-2 0v-4c0-.6.4-1 1-1zm0 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
              </svg>
            </div>
            <div className="font-semibold text-[16px] mb-1">Thông báo</div>
            <div className="text-[13px] text-gray-700 mb-5">Số lượng ghế tối đa được đặt là 8 ghế</div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10 rounded-md font-medium" onClick={()=>setLimitOpen(false)}>Đồng ý</button>
          </div>
        </div>
      )}
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
