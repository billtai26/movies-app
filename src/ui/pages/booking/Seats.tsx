import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { api } from "../../../lib/backendApi";
import SeatMap from "../../components/SeatMap";
import BookingBreadcrumb from "../../components/BookingBreadcrumb";
import Countdown from "../../components/Countdown";
import { useAuth } from "../../../store/auth";
import { toast } from "react-toastify";

// Định nghĩa kiểu dữ liệu ghế
type SeatState = "empty" | "held" | "booked" | "selected";
type Seat = {
  id: string;
  row: string;
  col: number;
  type: "normal" | "vip" | "couple";
  state: SeatState;
  userId?: string;
  price: number;
};

const HOLD_DURATION_SECONDS = 420;

export default function Seats() {
  const { id: showtimeId } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const incomingSelected = (location.state as any)?.selected || [];

  const { _id, email } = useAuth();
  const myUserId = _id || email || "";

  const [st, setSt] = useState<any>(null);
  const [movie, setMovie] = useState<any>(null);
  const [theater, setTheater] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [selectedTime, setSelectedTime] = useState("");
  const [limitOpen, setLimitOpen] = useState(false);

  // Hàm lấy thời gian còn lại
  const getRemainingTime = () => {
    const savedEndTime = localStorage.getItem("seat_hold_expiration");
    if (savedEndTime) {
      const diff = Math.floor((parseInt(savedEndTime) - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    }
    return HOLD_DURATION_SECONDS;
  };

  const [secondsLeft, setSecondsLeft] = useState(getRemainingTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================= LOAD DATA =============================
  useEffect(() => {
    if (!showtimeId) return;

    api.getShowtime(showtimeId).then((showtimeDetails: any) => {
      setSt(showtimeDetails);
      if (showtimeDetails?.startTime) {
        const d = new Date(showtimeDetails.startTime);
        setSelectedTime(`${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`);
      }

      if (showtimeDetails?.seats) {
        const toSeat = (seatObj: any): Seat => {
          const sn = seatObj.seatNumber;
          const status = seatObj.status;
          const heldBy = seatObj.heldBy;
          const price = seatObj.price;
          const type = seatObj.type || "normal"; 

          const row = sn.replace(/\d+/, "");
          const col = Number(sn.replace(/\D+/, ""));

          let state: SeatState = "empty";
          const isSaved = incomingSelected.includes(sn);

          if (status === "booked") state = "booked";
          else if (isSaved) state = "selected";
          else if (heldBy) state = heldBy === myUserId ? "selected" : "held";

          return {
            id: sn,
            row,
            col,
            type,
            state,
            userId: state === "selected" ? myUserId : heldBy,
            price,
          };
        };
        setSeats(showtimeDetails.seats.map(toSeat));
      }

      api.getMovie(showtimeDetails.movieId).then(setMovie);
      api.listTheaters().then((res: any) => {
        const list = Array.isArray(res) ? res : res.cinemas || [];
        const t = list.find((x: any) => String(x._id || x.id) === String(showtimeDetails.theaterId || showtimeDetails.cinemaId));
        setTheater(t);
      });
      api.listRooms().then((res: any) => {
        const list = Array.isArray(res) ? res : res.cinemaHalls || [];
        const r = list.find((x: any) => String(x._id || x.id) === String(showtimeDetails.roomId));
        setRoom(r);
      });
    }).catch(() => {});
  }, [showtimeId, myUserId]);

  // ============================= SOCKET =============================
  useEffect(() => {
    if (!showtimeId || !myUserId) return;
    const newSocket = io("http://localhost:8017"); 
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_room", showtimeId);
    });

    newSocket.on("seat:updated", (updatedSeat: Seat) => {
      setSeats((prev) =>
        prev.map((s) => {
          if (s.id !== updatedSeat.id) return s;
          if (updatedSeat.state === "held") {
            return updatedSeat.userId === myUserId
              ? { ...s, state: "selected", userId: myUserId }
              : { ...s, state: "held", userId: updatedSeat.userId };
          }
          if (updatedSeat.state === "empty") {
            return { ...s, state: "empty", userId: undefined };
          }
          return { ...s, state: updatedSeat.state, userId: updatedSeat.userId };
        })
      );
    });

    newSocket.on("seats:booked", (bookedSeatIds: string[]) => {
      setSeats((prev) =>
        prev.map((s) => (bookedSeatIds.includes(s.id) ? { ...s, state: "booked" } : s))
      );
    });

    return () => { newSocket.disconnect(); };
  }, [showtimeId, myUserId]);

  // ============================= HELPERS =============================
  const mySelectedSeats = useMemo(
    () => seats.filter((s) => s.state === "selected" && s.userId === myUserId),
    [seats, myUserId]
  );
  const mySelectedSeatIds = useMemo(() => mySelectedSeats.map((s) => s.id), [mySelectedSeats]);

  const summary = useMemo(() => {
    const selected = mySelectedSeats;
    if (selected.length === 0) return { singles: 0, singleIds: [], pricePerSeat: 0, total: 0 };

    const singleIds = selected.map((s) => s.id);
    const total = selected.reduce((sum, s) => sum + s.price, 0);
    const avgPrice = Math.round(total / selected.length);

    return { singles: singleIds.length, singleIds, pricePerSeat: avgPrice, total };
  }, [mySelectedSeats]);

  // [HÀM MỚI] Reset lại đồng hồ về 7 phút (dùng khi tương tác ghế)
  const resetTimer = () => {
    const endTime = Date.now() + HOLD_DURATION_SECONDS * 1000;
    localStorage.setItem("seat_hold_expiration", endTime.toString());
    setSecondsLeft(HOLD_DURATION_SECONDS);
  };

  // ============================= ACTIONS =============================
  const handleToggle = async (seatId: string) => {
    await handleToggleMany([seatId]);
  };

  const handleToggleMany = async (seatIds: string[]) => {
    if (!myUserId) {
      toast.warning("Vui lòng đăng nhập!");
      return;
    }

    const targetSeats = seats.filter(s => seatIds.includes(s.id));
    if (targetSeats.length === 0) return;

    const isUnavailable = targetSeats.some(s => s.state === 'booked' || (s.state === 'held' && s.userId !== myUserId));
    if (isUnavailable) {
      toast.warning("Một trong các ghế bạn chọn không khả dụng.");
      return;
    }

    const allSelectedByMe = targetSeats.every(s => s.state === 'selected' && s.userId === myUserId);

    try {
      if (allSelectedByMe) {
        // RELEASE (BỎ CHỌN)
        await api.releaseSeats(showtimeId!, seatIds);
        setSeats((prev) =>
          prev.map((s) => seatIds.includes(s.id) ? { ...s, state: "empty", userId: undefined } : s)
        );
        socket?.emit("seat:release_many", { showtimeId, seatIds, userId: myUserId });

        // [SỬA ĐỔI QUAN TRỌNG]: Nếu bỏ chọn ghế nhưng VẪN CÒN ghế khác -> Reset lại đồng hồ
        // (Nếu bỏ hết sạch ghế thì useEffect bên dưới sẽ tự lo việc xóa timer)
        const remainingCount = mySelectedSeats.length - seatIds.length;
        if (remainingCount > 0) {
            resetTimer();
        }

      } else {
        // HOLD (CHỌN THÊM)
        const currentCount = mySelectedSeats.length;
        const newCount = targetSeats.filter(s => s.state !== 'selected').length;
        if (currentCount + newCount > 8) {
          setLimitOpen(true);
          return;
        }
        await api.holdSeats(showtimeId!, seatIds);
        setSeats((prev) =>
          prev.map((s) => seatIds.includes(s.id) ? { ...s, state: "selected", userId: myUserId } : s)
        );
        seatIds.forEach(id => {
            socket?.emit("seat:hold", { showtimeId, seatId: id, userId: myUserId });
        });

        // [SỬA ĐỔI QUAN TRỌNG]: Khi chọn thêm ghế -> Reset lại đồng hồ ngay
        resetTimer();
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi thao tác ghế! Có thể ghế vừa bị người khác chọn.");
      api.getShowtime(showtimeId!).then((d: any) => setSt(d));
    }
  };

  const releaseAllMySeats = (notify = true) => {
    if (!socket || mySelectedSeatIds.length === 0) return;
    localStorage.removeItem("seat_hold_expiration");

    socket.emit("seat:release_many", { showtimeId, seatIds: mySelectedSeatIds, userId: myUserId });
    api.releaseSeats?.(showtimeId!, mySelectedSeatIds).catch(() => {});
    setSeats((prev) =>
      prev.map((s) => mySelectedSeatIds.includes(s.id) ? { ...s, state: "empty", userId: undefined } : s)
    );
    if (notify) toast.info("Đã hết thời gian giữ ghế.");
  };

  const handleNext = () => {
    if (mySelectedSeats.length === 0) {
      toast.info("Bạn chưa chọn ghế nào!");
      return;
    }
    nav("/booking/combos", {
      state: { id: showtimeId, selected: mySelectedSeatIds },
    });
  };

  // ============================= TIMER LOGIC (UPDATED) =============================
  useEffect(() => {
    // [SỬA ĐỔI QUAN TRỌNG]: Nếu danh sách ghế chưa tải xong (length = 0),
    // thì KHÔNG chạy logic bên dưới để tránh xóa nhầm localStorage.
    if (seats.length === 0) return;

    if (mySelectedSeats.length > 0) {
      // Nếu chưa có thời gian (lần đầu chọn), tạo mới. 
      // Nếu đã có (quay lại từ trang khác), giữ nguyên.
      if (!localStorage.getItem("seat_hold_expiration")) {
        const endTime = Date.now() + HOLD_DURATION_SECONDS * 1000;
        localStorage.setItem("seat_hold_expiration", endTime.toString());
      }
      
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          const remaining = getRemainingTime();
          setSecondsLeft(remaining);

          if (remaining <= 0) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            releaseAllMySeats(true);
            nav("/movies");
          }
        }, 1000);
      }
    } else {
      // Chỉ khi danh sách ghế ĐÃ TẢI XONG mà user không chọn ghế nào
      // thì mới xóa timer.
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setSecondsLeft(HOLD_DURATION_SECONDS);
      localStorage.removeItem("seat_hold_expiration");
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mySelectedSeats.length, seats.length]); // Thêm seats.length vào dependency

  // ============================= RENDER =============================
  const formatDateLabel = (dateStr: string) => {
    const dt = new Date(dateStr);
    const weekdays = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    return `${weekdays[dt.getUTCDay()]}, ${String(dt.getUTCDate()).padStart(2, "0")}/${String(dt.getUTCMonth() + 1).padStart(2, "0")}/${dt.getUTCFullYear()}`;
  };

  if (!st || !seats.length) return <div className="flex items-center justify-center h-96">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-0">
      <div className="container mx-auto p-4">
        <BookingBreadcrumb currentStep="seats" />

        {/* --- [MOBILE] --- */}
        <div className="md:hidden mt-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
           <div className="flex gap-4">
              <img 
                src={movie?.posterUrl} 
                alt="Movie Poster" 
                className="w-24 h-36 rounded-lg object-cover shadow-sm flex-shrink-0" 
              />
              <div className="flex flex-col justify-between flex-1">
                 <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                       {movie?.title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                       {movie?.genres?.join(", ")}
                    </p>
                 </div>
                 <div className="mt-2 space-y-1">
                    <div className="text-sm font-medium text-gray-800">
                       {theater?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                       {room?.name} • 2D Phụ đề
                    </div>
                 </div>
                 <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-200">
                    <div className="flex items-center gap-2">
                       <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded border border-blue-100">
                          {selectedTime}
                       </span>
                       <span className="text-xs text-gray-500">
                          {st?.startTime && formatDateLabel(st.startTime)}
                       </span>
                    </div>
                    <Countdown secondsLeft={secondsLeft} autoRun={false} />
                 </div>
              </div>
           </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_350px] lg:grid-cols-[1fr_400px] mt-4">
          
          {/* --- LEFT: SƠ ĐỒ GHẾ --- */}
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[600px] md:min-w-0"> 
                    <SeatMap
                        seats={seats}
                        aisleCols={[7]}
                        aisleRows={["D", "G"]}
                        maxSelected={8}
                        onLimitExceeded={() => setLimitOpen(true)}
                        onToggle={handleToggle}
                        onToggleMany={handleToggleMany}
                    />
                </div>
            </div>
          </div>

          {/* --- RIGHT: TÓM TẮT (DESKTOP) --- */}
          <div className="hidden md:block space-y-4 sticky top-4 h-fit">
            <div className="card p-5 space-y-4 bg-white shadow rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-70">Thời gian giữ ghế:</span>
                <Countdown secondsLeft={secondsLeft} autoRun={false} />
              </div>

              <div className="flex gap-4">
                <img src={movie?.posterUrl} className="h-48 w-32 rounded-lg object-cover shadow-sm" alt="Poster" />
                <div>
                  <div className="text-xl font-bold text-gray-800">{movie?.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{movie?.genres?.join(", ")}</div>
                </div>
              </div>

              <div className="opacity-80 mt-2 text-sm space-y-1">
                <div className="font-bold">{theater?.name}</div>
                <div>{room?.name}</div>
              </div>

              <div className="opacity-80 text-sm">
                Suất: <span className="font-bold text-blue-600">{selectedTime}</span> – {st?.startTime && formatDateLabel(st?.startTime)}
              </div>

              <hr className="my-3 border-dashed" />

              {summary.singles > 0 ? (
                <>
                  <div className="flex justify-between font-medium">
                    <span>{summary.singles}x Ghế</span>
                    <b>{summary.total.toLocaleString()} đ</b>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 break-words">
                    Ghế: {summary.singleIds.join(", ")}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 italic">Vui lòng chọn ghế</div>
              )}

              <hr className="my-3 border-dashed" />

              <div className="flex justify-between text-xl font-bold items-end">
                <span>Tổng cộng</span>
                <b className="text-orange-600 text-2xl">
                  {summary.total.toLocaleString()} đ
                </b>
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <button 
                type="button" 
                className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-gray-700 font-medium" 
                onClick={() => nav("/booking/select")}
              >
                Quay lại
              </button>

              <button
                type="button"
                className={`flex-1 px-6 py-3 rounded-lg text-white transition font-bold shadow-md ${
                  mySelectedSeats.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
                }`}
                onClick={handleNext}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- [MOBILE] FIXED BOTTOM BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
         {summary.singles > 0 && (
            <div className="mb-2 text-sm truncate px-1">
               <span className="text-gray-500">Ghế: </span>
               <span className="font-bold text-gray-900">{summary.singleIds.join(", ")}</span>
            </div>
         )}
         
         <div className="flex items-center gap-3">
            <button 
               type="button"
               onClick={() => nav(-1)}
               className="h-12 w-12 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 active:bg-gray-100 transition"
               aria-label="Quay lại"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
               </svg>
            </button>

            <div className="flex flex-col items-center">
               <span className="text-[10px] text-gray-500 uppercase tracking-wide">Tổng tiền</span>
               <span className="text-lg font-bold text-orange-600 leading-none">{summary.total.toLocaleString()} đ</span>
            </div>
            
            <button
               type="button"
               onClick={handleNext}
               className={`flex-1 h-12 rounded-lg font-bold text-white shadow-sm transition ${
                  mySelectedSeats.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
               }`}
            >
               Tiếp tục
            </button>
         </div>
      </div>

      {limitOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm text-center w-full">
            <h3 className="text-lg font-bold text-red-600 mb-2">Thông báo</h3>
            <p className="text-gray-600 mb-4">Bạn chỉ được chọn tối đa 8 ghế mỗi lần đặt.</p>
            <button className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition" onClick={() => setLimitOpen(false)}>
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}