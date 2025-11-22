import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { io, Socket } from 'socket.io-client' 
import { api } from '../../../lib/backendApi' 
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
  const { id } = useParams()
  const nav = useNavigate()
  
  // [QUAN TRỌNG]: Lấy danh sách ghế được gửi về từ trang Combos
  const location = useLocation();
  const incomingSelected = (location.state as any)?.selected || [];
  
  // Lấy userId từ store auth
  const { _id, email } = useAuth(); 
  const myUserId = _id || email || ""; 

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

  // 2. LOGIC LOAD DỮ LIỆU TỪ API
  useEffect(() => {
    if (!showtimeId) return;

    api.getShowtime(showtimeId).then((showtimeDetails: any) => {
      setSt(showtimeDetails);

      if (showtimeDetails && Array.isArray(showtimeDetails.seats)) {
        const toSeat = (sn:string, status:string, heldBy?:string): Seat => {
          const row = sn.replace(/\d+/,'')
          const colStr = sn.replace(/\D+/,'')
          const col = Number(colStr)
          
          let state: SeatState = 'empty';

          // [FIX LOGIC]: Kiểm tra xem ghế này có nằm trong danh sách user vừa chọn trước đó không
          const isSaved = incomingSelected.includes(sn);

          if (status === 'booked') {
            state = 'booked';
          } 
          // Ưu tiên cao nhất: Nếu ghế nằm trong danh sách truyền về -> HIỂN THỊ SELECTED (MÀU CAM)
          else if (isSaved) {
            state = 'selected';
          }
          // Tiếp theo mới check dữ liệu từ server
          else if (heldBy) {
            state = (heldBy === myUserId) ? 'selected' : 'held';
          }

          // Đảm bảo userId chính xác để logic click hoạt động
          const finalUserId = heldBy || (state === 'selected' ? myUserId : undefined);

          return { id: sn, row, col, type: 'normal', state, userId: finalUserId }
        }
        const converted: Seat[] = showtimeDetails.seats.map((s:any)=> toSeat(s.seatNumber, s.status, s.heldBy))
        setSeats(converted)
      } else {
        setSeats([]); 
      }

      if (showtimeDetails) {
        // Load thông tin phim
        api.getMovie(showtimeDetails.movieId).then(setMovie);
        
        // Load thông tin rạp (xử lý cả trường hợp trả về mảng hoặc object phân trang)
        api.listTheaters().then((res: any) => {
           const list = Array.isArray(res) ? res : (res.cinemas || []);
           setTheater(list.find((t: any) => String(t._id || t.id) === String(showtimeDetails.theaterId || showtimeDetails.cinemaId)));
        }).catch(err => console.error("Lỗi tải rạp:", err));

        // Load thông tin phòng chiếu
        api.listRooms().then((res: any) => {
           const list = Array.isArray(res) ? res : (res.cinemaHalls || []);
           setRoom(list.find((r: any) => String(r._id || r.id) === String(showtimeDetails.roomId)));
        }).catch(err => console.error("Lỗi tải phòng:", err));
      }
    }).catch(err => {
      console.error("Lỗi tải suất chiếu:", err);
    });

  }, [showtimeId, myUserId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Logic cập nhật giờ chiếu (khi suất chiếu thay đổi)
  useEffect(()=>{
    const parseIsoWall = (iso?:string)=>{
      if(!iso) return null; const m = (iso as string).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/); if(m) return {dd:m[3],mm:m[2],hh:m[4],min:m[5]}; const d=new Date(iso as string); return {dd:String(d.getDate()).padStart(2,'0'), mm:String(d.getMonth()+1).padStart(2,'0'), hh:String(d.getHours()).padStart(2,'0'), min:String(d.getMinutes()).padStart(2,'0')}; }
    if (st?.startTime) {
      const base = parseIsoWall(st.startTime)!; const hhmm = `${base.hh}:${base.min}`
      setSelectedTime(hhmm)
      ;(async () => {
        try {
          const res: any = await api.listShowtimes()
          const all = Array.isArray(res) ? res : (res.showtimes || []);
          
          const dayMM = (iso:string)=>{ const p=parseIsoWall(iso)!; return `${p.dd}/${p.mm}` }
          const filtered = all.filter((x:any)=> x.movieId===st.movieId && dayMM(x.startTime)===dayMM(st.startTime))
          
          setAvailableShows(filtered)
          const toHHmm = (iso?:string)=>{ if(!iso) return null; const p=parseIsoWall(iso)!; return `${p.hh}:${p.min}` }
          const times = Array.from(new Set(filtered.map((x:any)=> x.time || toHHmm(x.startTime)).filter(Boolean))) as string[]
          setAvailableTimes(times.length?times:[hhmm])
        } catch (err) {}
      })()
      }
  }, [st])

  // 3. KẾT NỐI SOCKET (Realtime)
  useEffect(() => {
    if (!showtimeId || !myUserId) return;

    const newSocket = io("http://localhost:8017"); 
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_room', showtimeId);
    });

    // Lắng nghe sự kiện cập nhật ghế đơn lẻ
    newSocket.on('seat:updated', (updatedSeat: Seat) => {
        setSeats(prevSeats =>
            prevSeats.map(s => {
                if (s.id !== updatedSeat.id) return s;

                // Nếu ghế được giữ bởi CHÍNH MÌNH -> State hiển thị là 'selected'
                if (updatedSeat.state === 'held' && updatedSeat.userId === myUserId) {
                    return { ...s, state: 'selected', userId: myUserId };
                }
                // Nếu ghế được giữ bởi NGƯỜI KHÁC -> State hiển thị là 'held'
                if (updatedSeat.state === 'held' && updatedSeat.userId !== myUserId) {
                    return { ...s, state: 'held', userId: updatedSeat.userId };
                }
                // Nếu ghế trống
                if (updatedSeat.state === 'empty') {
                    return { ...s, state: 'empty', userId: undefined };
                }
                // Các trạng thái khác (booked)
                return { ...s, state: updatedSeat.state, userId: updatedSeat.userId };
            })
        );
    });

    // Lắng nghe sự kiện cập nhật khi vé đã bán thành công
    newSocket.on('seats:booked', (bookedSeatIds: string[]) => {
        setSeats(prevSeats =>
            prevSeats.map(s =>
                bookedSeatIds.includes(s.id) ? { ...s, state: 'booked' } : s
            )
        );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [showtimeId, myUserId]);

  // 4. XỬ LÝ LOGIC GHẾ CỦA TÔI & TIMER
  // [FIX]: Move basePrice ra ngoài useMemo để tránh lỗi reference
  const basePrice = st?.price || 0
  const couplePrice = basePrice * 2 + 10000

  const mySelectedSeats = useMemo(() => {
    return seats.filter(s => s.state === 'selected' && s.userId === myUserId);
  }, [seats, myUserId]);
  
  const mySelectedSeatIds = useMemo(() => mySelectedSeats.map(s => s.id), [mySelectedSeats]);

  // Hàm giải phóng tất cả ghế đang giữ
  const releaseAllMySeats = (notifyUser = true) => {
    if (!socket || mySelectedSeatIds.length === 0) return;

    // Bắn socket
    socket.emit('seat:release_many', { showtimeId, seatIds: mySelectedSeatIds, userId: myUserId });
    
    // Gọi API release (nếu backend hỗ trợ)
    if ('releaseSeats' in api) {
        (api as any).releaseSeats(showtimeId!, mySelectedSeatIds).catch(() => {});
    }

    // Cập nhật UI
    setSeats(prev => prev.map(s => mySelectedSeatIds.includes(s.id) ? { ...s, state: 'empty', userId: undefined } : s));
    
    if (notifyUser) {
      toast.info("Đã hết thời gian giữ ghế. Vui lòng chọn lại.");
    }
  };

  // Logic Timer: Chỉ chạy khi có ghế được chọn
  useEffect(() => {
    if (mySelectedSeats.length > 0) {
      // Nếu chưa có timer thì bắt đầu đếm
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
      // Nếu không còn ghế nào chọn -> Reset timer
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

  // Xử lý khi người dùng đóng tab hoặc reload trang
  const handleBeforeUnload = () => releaseAllMySeats(false);
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [socket, mySelectedSeatIds]);

  // 5. XỬ LÝ SỰ KIỆN CLICK GHẾ
  const handleToggle = async (seatId: string) => {
    if (!myUserId) {
      toast.warning("Vui lòng đăng nhập để đặt vé!");
      return; 
    }

    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.state === 'booked' || (seat.state === 'held' && seat.userId !== myUserId)) return;

    try {
      // --- CHỌN GHẾ (HOLD) ---
      if (seat.state === 'empty') {
        if (mySelectedSeats.length >= 8) {
          setLimitOpen(true);
          return;
        }
        
        // Gọi API giữ ghế
        if ('holdSeats' in api) {
           await (api as any).holdSeats(showtimeId!, [seatId]);
        }

        // Update UI ngay lập tức (Optimistic)
        setSeats(prev => prev.map(s => s.id === seatId ? {...s, state: 'selected', userId: myUserId} : s));
        
        // Báo Socket
        if (socket) socket.emit('seat:hold', { showtimeId, seatId, userId: myUserId });
      
      } 
      // --- BỎ CHỌN (RELEASE) ---
      else if (seat.state === 'selected') {
        
        // Gọi API nhả ghế
        if ('releaseSeats' in api) {
           await (api as any).releaseSeats(showtimeId!, [seatId]);
        }

        // Update UI
        setSeats(prev => prev.map(s => s.id === seatId ? {...s, state: 'empty', userId: undefined} : s));
        
        // Báo Socket
        if (socket) socket.emit('seat:release', { showtimeId, seatId, userId: myUserId });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Lỗi thao tác ghế.";
      toast.error(msg);
      // Nếu lỗi, load lại data mới nhất để đồng bộ
      api.getShowtime(showtimeId!).then((d:any) => setSt(d));
    }
  };

  // Xử lý chọn/bỏ chọn nhiều ghế (Ví dụ ghế đôi)
  const handleToggleMany = async (seatIds: string[]) => {
    if (!myUserId) { toast.warning("Vui lòng đăng nhập!"); return; }
    
    const seatsToToggle = seats.filter(s => seatIds.includes(s.id));
    // Nếu có ghế nào đã bị book hoặc người khác giữ -> Bỏ qua
    if (seatsToToggle.some(s => s.state === 'booked' || (s.state === 'held' && s.userId !== myUserId))) return;

    const isSelecting = seatsToToggle.some(s => s.state === 'empty');
    
    try {
      if (isSelecting) {
        const newSeatsCount = seatsToToggle.filter(s => s.state === 'empty').length;
        if (mySelectedSeats.length + newSeatsCount > 8) { setLimitOpen(true); return; }

        if ('holdSeats' in api) await (api as any).holdSeats(showtimeId!, seatIds);

        setSeats(prev => prev.map(s => seatIds.includes(s.id) && s.state === 'empty' ? {...s, state: 'selected', userId: myUserId} : s));
        if (socket) seatIds.forEach(sid => socket.emit('seat:hold', { showtimeId, seatId: sid, userId: myUserId }));

      } else {
        if ('releaseSeats' in api) await (api as any).releaseSeats(showtimeId!, seatIds);

        setSeats(prev => prev.map(s => seatIds.includes(s.id) && s.state === 'selected' ? {...s, state: 'empty', userId: undefined} : s));
        if (socket) seatIds.forEach(sid => socket.emit('seat:release', { showtimeId, seatId: sid, userId: myUserId }));
      }
    } catch (error: any) {
       toast.error("Không thể giữ nhóm ghế này.");
    }
  };

  // 6. RENDER & FORMATTING
  const formatDateLabel = (dateStr:string) => {
    if (!dateStr) return '';
    const dt = new Date(dateStr)
    const weekdays = ['Chủ nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy']
    return `${weekdays[dt.getDay()]}, ${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`
  }

  const summary = React.useMemo(() => {
    const set = new Set(mySelectedSeatIds);
    let singles = 0, couples = 0
    const singleIds:string[] = []
    const couplePairLabels:string[] = []
    const aisleCols = [7] 

    mySelectedSeats.forEach(seat => {
      const { id, row, col } = seat;
       if (row === 'H'){ 
         if (col % 2 === 0) return 
         const nextCol = col + 1
         if (aisleCols.includes(nextCol)){ singles++; singleIds.push(id); return }
         
         const pairIds = [`${row}${col}`, `${row}${nextCol}`]
         if (pairIds.every(sid => set.has(sid))){
           couples++; couplePairLabels.push(`H${Math.ceil(col/2)}`)
         } else { singles++; singleIds.push(id) }
       } else { singles++; singleIds.push(id) }
     })
    return { singles, couples, singleIds, couplePairLabels, total: singles * basePrice + couples * couplePrice }
  }, [mySelectedSeats, mySelectedSeatIds, basePrice, couplePrice])

  // Loading UI
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

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <div className="card">
          <div className="mb-2 font-semibold">Đổi suất chiếu</div>
          <div className="flex flex-wrap gap-2">
            {availableTimes.map(t => (
              <button
                key={t}
                className={`px-4 py-1 rounded border text-sm ${selectedTime===t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white hover:bg-gray-50'}`}
                onClick={()=> {
                  setSelectedTime(t)
                  const target = availableShows.find((x:any)=> (x.time || (new Date(x.startTime).getHours() + ':' + new Date(x.startTime).getMinutes())) === t)
                  if (target && target.id !== showtimeId) nav(`/booking/seats/${target.id || target._id}`)
                }}
              >{t}</button>
            ))}
          </div>
        </div>
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
            {/* Chỉ hiển thị giờ từ State, tắt autoRun của component */}
            <Countdown secondsLeft={secondsLeft} autoRun={false} /> 
          </div>

          <div className="flex gap-4">
            <img src={movie?.poster} className="h-48 w-32 rounded-lg object-cover" alt={movie?.title}/>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={()=>setLimitOpen(false)}>
           <div className="bg-white rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.18)] w-[360px] px-6 pt-5 pb-4 text-center" onClick={e=>e.stopPropagation()}>
            <div className="font-semibold text-[16px] mb-1">Thông báo</div>
            <div className="text-[13px] text-gray-700 mb-5">Số lượng ghế tối đa được đặt là 8 ghế</div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10 rounded-md font-medium" onClick={()=>setLimitOpen(false)}>Đồng ý</button>
          </div>
        </div>
      )}
      {needSelectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={()=>setNeedSelectOpen(false)}>
           <div className="bg-white rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.18)] w-[360px] px-6 pt-5 pb-4 text-center" onClick={e=>e.stopPropagation()}>
            <div className="font-semibold text-[16px] mb-1">Thông báo</div>
            <div className="text-[13px] text-gray-700 mb-5">Vui lòng chọn ghế</div>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10 rounded-md font-medium" onClick={()=>setNeedSelectOpen(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  )
}
