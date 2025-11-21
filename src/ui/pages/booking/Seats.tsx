import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// Giả sử bạn dùng socket.io-client
import { io, Socket } from 'socket.io-client' 
// Import api từ lib
import { api } from '../../../lib/api' 
import SeatMap from '../../components/SeatMap'
import BookingBreadcrumb from '../../components/BookingBreadcrumb'
import Countdown from '../../components/Countdown' 
import { useAuth } from '../../../store/auth' 
import { toast } from 'react-toastify'

// --- Định nghĩa kiểu dữ liệu ---
type SeatState = 'empty' | 'held' | 'booked' | 'selected'
type Seat = {
  id: string, 
  row: string, 
  col: number, 
  type: 'normal' | 'vip' | 'couple', 
  state: SeatState,
  userId?: string 
}

// === CÀI ĐẶT TIMER ===
const HOLD_DURATION_SECONDS = 420; // 7 phút

export default function Seats(){
  // 1. HOOKS & STATE CƠ BẢN
  const { id: showtimeId } = useParams()
  const nav = useNavigate()
  
  // Lấy userId từ store auth
  const { _id, email } = useAuth(); 
  const myUserId = _id || email || ""; // Ưu tiên lấy _id nếu có

  // State cho dữ liệu
  const [st, setSt] = React.useState<any>(null)
  const [movie, setMovie] = React.useState<any>(null)
  const [theater, setTheater] = React.useState<any>(null)
  const [room, setRoom] = React.useState<any>(null)

  // State quản lý danh sách ghế
  const [seats, setSeats] = useState<Seat[]>([])
  
  // State quản lý kết nối WebSocket
  const [socket, setSocket] = useState<Socket | null>(null)

  // State cho UI
  const [selectedTime, setSelectedTime] = React.useState<string>('')
  const [availableTimes, setAvailableTimes] = React.useState<string[]>([])
  const [availableShows, setAvailableShows] = React.useState<any[]>([])
  const [limitOpen, setLimitOpen] = React.useState(false)
  const [needSelectOpen, setNeedSelectOpen] = React.useState(false)

  // === STATE TIMER ===
  const [secondsLeft, setSecondsLeft] = useState(HOLD_DURATION_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 2. LOGIC LOAD DỮ LIỆU BAN ĐẦU
  useEffect(() => {
    if (!showtimeId) return;

    api.getShowtime(showtimeId).then((showtimeDetails) => {
      setSt(showtimeDetails as any);

      if (showtimeDetails && Array.isArray(showtimeDetails.seats)) {
        const toSeat = (sn:string, status:string, heldBy?:string): Seat => {
          const row = sn.replace(/\d+/,'')
          const colStr = sn.replace(/\D+/,'')
          const col = Number(colStr)
          // Logic mapping state từ backend về frontend
          const state: SeatState = status === 'booked' ? 'booked' : (heldBy ? 'held' : 'empty')
          return { id: sn, row, col, type: 'normal', state, userId: heldBy || undefined }
        }
        const converted: Seat[] = showtimeDetails.seats.map((s:any)=> toSeat(s.seatNumber, s.status, s.heldBy))
        setSeats(converted)
      } else {
        console.error("API không trả về 'seats'.");
        setSeats([]); 
      }

      if (showtimeDetails) {
        api.getMovie(showtimeDetails.movieId).then(setMovie);
        
        // --- SỬA LỖI TÌM RẠP (Cinema) ---
        api.listTheaters().then(res => {
          // Xử lý trường hợp trả về object có phân trang hoặc mảng
          const list = Array.isArray(res) ? res : (res.cinemas || res.data || []);
          if (Array.isArray(list)) {
            setTheater(list.find((t: any) => (t.id || t._id) === (showtimeDetails.theaterId || showtimeDetails.cinemaId)));
          }
        }).catch(err => console.error("Lỗi tải rạp:", err));

        // --- SỬA LỖI TÌM PHÒNG (Room/Hall) ---
        api.listRooms().then(res => {
          // Xử lý tương tự với API phòng chiếu
          const list = Array.isArray(res) ? res : (res.cinemaHalls || res.halls || res.data || []);
          if (Array.isArray(list)) {
            setRoom(list.find((r: any) => (r.id || r._id) === showtimeDetails.roomId || (r.id || r._id) === showtimeDetails.theaterId)); // Dự phòng theaterId là id phòng
          }
        }).catch(err => console.error("Lỗi tải phòng:", err));
      }

    }).catch(err => {
      console.error("Lỗi khi lấy chi tiết suất chiếu:", err);
      setSt(null);
      setSeats([]);
    });

  }, [showtimeId])

  // Effect để cập nhật danh sách giờ chiếu
  useEffect(()=>{
    const parseIsoWall = (iso?:string)=>{
      if(!iso) return null; const m = (iso as string).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/); if(m) return {dd:m[3],mm:m[2],hh:m[4],min:m[5]}; const d=new Date(iso as string); return {dd:String(d.getDate()).padStart(2,'0'), mm:String(d.getMonth()+1).padStart(2,'0'), hh:String(d.getHours()).padStart(2,'0'), min:String(d.getMinutes()).padStart(2,'0')}; }
    if (st?.startTime) {
      const base = parseIsoWall(st.startTime)!; const hhmm = `${base.hh}:${base.min}`
      setSelectedTime(hhmm)
      ;(async () => {
        try {
          const res = await api.listShowtimes()
          
          // --- SỬA LỖI LỌC SHOWTIMES ---
          // Lấy mảng showtimes từ kết quả trả về (object hoặc array)
          const all = Array.isArray(res) ? res : (res.showtimes || res.data || []);

          if (!Array.isArray(all)) {
            console.warn("API listShowtimes trả về dữ liệu không hợp lệ:", res);
            return;
          }

          const dayMM = (iso:string)=>{ const p=parseIsoWall(iso)!; return `${p.dd}/${p.mm}` }
          const filtered = all.filter((x:any)=> x.movieId===st.movieId && ((x.theaterId===st.theaterId) || (x.cinemaId===st.theaterId) || (x.theaterId===st.cinemaId) || (x.cinemaId===st.cinemaId)) && dayMM(x.startTime)===dayMM(st.startTime))
          setAvailableShows(filtered)
          const toHHmm = (iso?:string)=>{ if(!iso) return null; const p=parseIsoWall(iso)!; return `${p.hh}:${p.min}` }
          const times = Array.from(new Set(filtered.map((x:any)=> x.time || toHHmm(x.startTime)).filter(Boolean))) as string[]
          setAvailableTimes(times.length?times:[hhmm])
        } catch (err) {
          console.error("Lỗi load lịch chiếu:", err);
        }
      })()
      }
  }, [st])

  // 3. LOGIC KẾT NỐI WEBSOCKET
  useEffect(() => {
    if (!showtimeId || !myUserId) return;

    // --- SỬA CỔNG SOCKET THÀNH 8017 ---
    const newSocket = io("http://localhost:8017"); 
    setSocket(newSocket);

    newSocket.on('connect', () => {
      // console.log("Socket connected:", newSocket.id);
      newSocket.emit('join_room', showtimeId);
    });

    // Lắng nghe cập nhật ghế
    // --- SỬA ĐOẠN NÀY ---
        newSocket.on('seat:updated', (updatedSeat: Seat) => {
            setSeats(prevSeats =>
                prevSeats.map(s => {
                    if (s.id !== updatedSeat.id) return s;

                    // Logic mới: Giữ lại toàn bộ thông tin cũ của s (...s)
                    // và chỉ ghi đè những thông tin thay đổi từ updatedSeat
                    
                    // Nếu người khác giữ -> set state 'held'
                    if (updatedSeat.state === 'held' && updatedSeat.userId !== myUserId) {
                        return { ...s, state: 'held', userId: updatedSeat.userId };
                    }
                    
                    // Nếu ghế được nhả ra -> set state 'empty'
                    if (updatedSeat.state === 'empty') {
                        return { ...s, state: 'empty', userId: undefined };
                    }

                    // Trường hợp khác (ví dụ 'booked'), cập nhật state tương ứng
                    return { ...s, state: updatedSeat.state, userId: updatedSeat.userId };
                })
            );
        });
        // --------------------

        // Lắng nghe khi ghế đã bán (giữ nguyên)
        newSocket.on('seats:booked', (bookedSeatIds: string[]) => {
            setSeats(prevSeats =>
                prevSeats.map(s =>
                    bookedSeatIds.includes(s.id) ? { ...s, state: 'booked' } : s
                )
            );
        });

        return () => {
            newSocket.emit('leave_room', showtimeId);
            newSocket.disconnect();
        };
    }, [showtimeId, myUserId]);

  // 4. XỬ LÝ GHẾ CỦA TÔI
  const mySelectedSeats = useMemo(() => {
    if (seats.some(s => s.userId)) {
      return seats.filter(s => s.state === 'selected' && s.userId === myUserId);
    }
    return seats.filter(s => s.state === 'selected');
  }, [seats, myUserId]);
  
  const mySelectedSeatIds = useMemo(() => mySelectedSeats.map(s => s.id), [mySelectedSeats]);

  const releaseAllMySeats = (notifyUser = true) => {
    if (!socket || mySelectedSeatIds.length === 0) return;

    // Bắn socket để báo client khác (Backend job sẽ tự clear sau timeout nếu ko có API release explicit)
    socket.emit('seat:release_many', { 
      showtimeId, 
      seatIds: mySelectedSeatIds, 
      userId: myUserId 
    });

    // Gọi API Release Seats nếu backend có hỗ trợ endpoint này (Optional nhưng recommended)
    api.releaseSeats && api.releaseSeats(showtimeId!, mySelectedSeatIds).catch(err => console.error(err));

    setSeats(prev => 
      prev.map(s => 
        mySelectedSeatIds.includes(s.id) ? { ...s, state: 'empty', userId: undefined } : s
      )
    );
    
    if (notifyUser) {
      toast.info("Đã hết thời gian giữ ghế. Vui lòng chọn lại.");
    }
  };

  // 5. TIMER
  useEffect(() => {
    if (mySelectedSeats.length > 0) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setSecondsLeft(prevSeconds => {
            if (prevSeconds <= 1) {
              clearInterval(timerRef.current!);
              timerRef.current = null;
              releaseAllMySeats(true);
              nav('/movies'); 
              return 0;
            }
            return prevSeconds - 1;
          });
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setSecondsLeft(HOLD_DURATION_SECONDS);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mySelectedSeats.length, socket, showtimeId, nav]);

  // 6. XỬ LÝ RỜI TRANG
  useEffect(() => {
    const handleBeforeUnload = () => {
      releaseAllMySeats(false);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket, mySelectedSeatIds]);

  // 7. HÀM XỬ LÝ CLICK (ĐÃ TÍCH HỢP API)
  const handleToggle = async (seatId: string) => {
    if (!myUserId) {
      toast.warning("Vui lòng đăng nhập để đặt vé!");
      return; 
    }

    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.state === 'booked' || (seat.state === 'held' && seat.userId !== myUserId)) return;

    try {
      if (seat.state === 'empty') {
        // --- CHỌN GHẾ (HOLD) ---
        if (mySelectedSeats.length >= 8) {
          setLimitOpen(true);
          return;
        }

        // 1. Gọi API giữ ghế
        // Đảm bảo bạn đã thêm hàm holdSeats vào file api.ts
        await api.holdSeats(showtimeId!, [seatId]);

        // 2. Cập nhật UI (Optimistic update)
        setSeats(prev => prev.map(s => s.id === seatId ? {...s, state: 'selected', userId: myUserId} : s));
        
        // 3. Emit socket để báo cho người khác
        if (socket) socket.emit('seat:hold', { showtimeId, seatId, userId: myUserId });
      
      } else if (seat.state === 'selected') {
        // --- BỎ CHỌN (RELEASE) ---
        try {
          // 1. Gọi API nhả ghế phía Backend (QUAN TRỌNG)
          if (api.releaseSeats) {
             await api.releaseSeats(showtimeId!, [seatId]);
          }

          // 2. Cập nhật UI
          setSeats(prev => prev.map(s => s.id === seatId ? {...s, state: 'empty', userId: undefined} : s));
          
          // 3. Báo Socket
          if (socket) socket.emit('seat:release', { showtimeId, seatId, userId: myUserId });
        } catch (error) {
          console.error("Lỗi nhả ghế:", error);
          // Vẫn cho phép update UI nếu API lỗi nhẹ, hoặc toast lỗi
        }
      }
    } catch (error: any) {
      console.error("Lỗi thao tác ghế:", error);
      const msg = error.response?.data?.errors || "Không thể giữ ghế này. Có thể ghế đã được chọn.";
      toast.error(msg);
      
      // Tải lại trạng thái ghế mới nhất từ server để đồng bộ
      const latest = await api.getShowtime(showtimeId!);
      // (Logic update lại seats nếu cần thiết có thể thêm ở đây)
    }
  };

  const handleToggleMany = async (seatIds: string[]) => {
    if (!myUserId) {
      toast.warning("Vui lòng đăng nhập!");
      return;
    }
    
    const seatsToToggle = seats.filter(s => seatIds.includes(s.id));
    if (seatsToToggle.some(s => s.state === 'booked' || (s.state === 'held' && s.userId !== myUserId))) return;

    const isSelecting = seatsToToggle.some(s => s.state === 'empty');
    
    try {
      if (isSelecting) {
        // --- CHỌN NHIỀU GHẾ ---
        const newSeatsCount = seatsToToggle.filter(s => s.state === 'empty').length;
        if (mySelectedSeats.length + newSeatsCount > 8) { 
          setLimitOpen(true);
          return;
        }

        // 1. Gọi API giữ nhiều ghế
        await api.holdSeats(showtimeId!, seatIds);

        // 2. Update UI
        setSeats(prev => prev.map(s => seatIds.includes(s.id) && s.state === 'empty' ? {...s, state: 'selected', userId: myUserId} : s));
        
        // 3. Socket
        if (socket) {
          seatIds.forEach(seatId => {
             socket.emit('seat:hold', { showtimeId, seatId, userId: myUserId });
          });
        }

      } else {
        // --- BỎ CHỌN NHIỀU GHẾ ---
        try {
           // 1. Gọi API nhả danh sách ghế
           if (api.releaseSeats) {
             await api.releaseSeats(showtimeId!, seatIds);
           }

           // 2. Update UI
           setSeats(prev => prev.map(s => seatIds.includes(s.id) && s.state === 'selected' ? {...s, state: 'empty', userId: undefined} : s));
           
           // 3. Socket
           if (socket) {
             seatIds.forEach(seatId => {
               socket.emit('seat:release', { showtimeId, seatId, userId: myUserId });
             });
           }
        } catch (error) {
           console.error("Lỗi nhả ghế đôi:", error);
        }
      }
    } catch (error: any) {
       console.error("Lỗi giữ ghế đôi:", error);
       toast.error("Không thể giữ nhóm ghế này. Vui lòng thử lại.");
    }
  };

  // 8. LOGIC TÍNH TOÁN UI
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
  const basePrice = st?.price || 0
  const couplePrice = basePrice * 2 + 10000

  const summary = React.useMemo(() => {
    const set = new Set(mySelectedSeatIds);
    let singles = 0, couples = 0
    const singleIds:string[] = []
    const couplePairLabels:string[] = []
    
    // Lưu ý: Cần đảm bảo logic 'aisleCols' đồng bộ với component SeatMap
    const aisleCols = [7] 

    mySelectedSeats.forEach(seat => {
      const { id, row, col } = seat;
       if (row === 'H'){ // Giả định hàng H là ghế đôi
         if (col % 2 === 0) {
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
  }, [mySelectedSeats, mySelectedSeatIds, basePrice, couplePrice])

  // 9. LOADING
  if (!st || !seats.length) {
    return (
      <div className="flex items-center justify-center w-full h-96"> 
        <div role="status">
          {/* Loading spinner SVG */}
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
                  if (target && target.id !== showtimeId) nav(`/booking/seats/${target.id}`)
                }}
              >{t}</button>
            ))}
          </div>
        </div>
        {/* Map ghế */}
        <div className="card p-4">
          <div className="max-h-[520px] overflow-y-auto scrollbar-thin">
            <SeatMap 
              seats={seats} 
              aisleCols={[7]}
              aisleRows={["D","G"]}
              maxSelected={8} 
              onLimitExceeded={() => setLimitOpen(true)}
              onToggle={handleToggle} 
              onToggleMany={handleToggleMany} 
            />
          </div>
        </div>
      </div>
      
      {/* Cột phải - Tóm tắt */}
      <div className="space-y-4 md:sticky md:top-4">
        <div className="card p-5 space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Thời gian giữ ghế:</div>
            <Countdown secondsLeft={secondsLeft} /> 
          </div>

          <div className="flex gap-4">
            <img src={movie?.poster} className="h-48 w-32 rounded-lg object-cover"/>
            <div className="text-base">
              <div className="text-xl font-semibold leading-tight">{movie?.title}</div>
              {movie?.rating!=null && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-700">T{movie.rating}</span>
              )}
            </div>
          </div>
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
          {mySelectedSeats.length === 0 && (
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
              if (mySelectedSeats.length === 0){
                setNeedSelectOpen(true)
                return
              }
              nav('/booking/combos',{ state:{ id: showtimeId, selected: mySelectedSeatIds }})
            }}
          >Tiếp tục</button>
        </div>
      </div>

      {/* Modals */}
      {limitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
           <div className="bg-white rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.18)] w-[360px] px-6 pt-5 pb-4 text-center">
            <div className="font-semibold text-[16px] mb-1">Thông báo</div>
            <div className="text-[13px] text-gray-700 mb-5">Số lượng ghế tối đa được đặt là 8 ghế</div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10 rounded-md font-medium" onClick={()=>setLimitOpen(false)}>Đồng ý</button>
          </div>
        </div>
      )}
      {needSelectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
           <div className="bg-white rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.18)] w-[360px] px-6 pt-5 pb-4 text-center">
            <div className="font-semibold text-[16px] mb-1">Thông báo</div>
            <div className="text-[13px] text-gray-700 mb-5">Vui lòng chọn ghế</div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10 rounded-md font-medium" onClick={()=>setNeedSelectOpen(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  )
}
