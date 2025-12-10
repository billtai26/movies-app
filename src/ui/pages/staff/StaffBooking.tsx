import React, { useEffect, useState } from "react";
import SeatMap from "../../components/SeatMap";
import { api } from "../../../lib/api";
import { toast } from "react-toastify";

// Định nghĩa lại Type cho Ghế để khớp với SeatMap
type SeatState = 'empty' | 'held' | 'booked' | 'selected';
type Seat = { 
  id: string; 
  row: string; 
  col: number; 
  type: 'normal' | 'vip' | 'couple'; 
  state: SeatState; 
  price: number; 
};

export default function StaffBooking() {
  const [movies, setMovies] = useState<any[]>([]);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedShowtime, setSelectedShowtime] = useState<string>("");
  const [selectedCombo, setSelectedCombo] = useState<string>("");
  
  // State quản lý ghế cho SeatMap
  const [seats, setSeats] = useState<Seat[]>([]);
  // Danh sách ID ghế đang chọn (để gửi API)
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Lấy danh sách Phim & Combo
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMovies, resCombos] = await Promise.all([
          api.listMovies({ limit: 100 }), // Lấy nhiều phim để nhân viên chọn
          api.listCombos()
        ]);

        // Xử lý response Movies
        const movieList = resMovies.movies || (Array.isArray(resMovies) ? resMovies : []);
        setMovies(movieList);

        // Xử lý response Combos
        const comboList = resCombos.combos || (Array.isArray(resCombos) ? resCombos : []);
        setCombos(comboList);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        toast.error("Không thể tải danh sách phim/combo");
      }
    };
    fetchData();
  }, []);

  // 2. Lấy suất chiếu khi chọn Phim
  useEffect(() => {
    if (selectedMovie) {
      api.listShowtimesByMovie(selectedMovie)
        .then((res) => {
          // Lấy mảng showtimes từ response
          const list = res.showtimes || (Array.isArray(res) ? res : []);
          
          // [DEBUG] Log dữ liệu ra để xem cấu trúc thực tế
          console.log("API Showtimes Data:", list); 
          
          setShowtimes(list);
        })
        .catch((err) => {
          console.error(err);
          setShowtimes([]);
        });
    } else {
      setShowtimes([]);
    }
    // Reset khi đổi phim
    setSelectedShowtime("");
    setSeats([]);
    setSelectedSeatIds([]);
  }, [selectedMovie]);

  // 3. Lấy sơ đồ ghế khi chọn Suất chiếu
  useEffect(() => {
    if (!selectedShowtime) {
      setSeats([]);
      return;
    }

    setLoading(true);
    api.getShowtime(selectedShowtime)
      .then((st: any) => {
        if (st && st.seats) {
          // Map dữ liệu ghế từ API sang format của SeatMap
          const mapData: Seat[] = st.seats.map((s: any) => {
            const rowMatch = s.seatNumber.match(/[A-Z]+/);
            const colMatch = s.seatNumber.match(/\d+/);
            const row = rowMatch ? rowMatch[0] : "A";
            const col = colMatch ? parseInt(colMatch[0]) : 1;

            let state: SeatState = 'empty';
            if (s.status === 'booked') state = 'booked';
            else if (s.heldBy) state = 'held';

            return {
              id: s.seatNumber,
              row,
              col,
              type: s.type || 'normal',
              state,
              price: s.price || 50000
            };
          });
          setSeats(mapData);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Lỗi tải sơ đồ ghế");
      })
      .finally(() => setLoading(false));
      
    setSelectedSeatIds([]);
  }, [selectedShowtime]);

  // 4. Xử lý chọn ghế trên Map
  const handleToggleSeat = (seatId: string) => {
    setSeats(prev => prev.map(s => {
      if (s.id !== seatId) return s;
      if (s.state === 'booked' || s.state === 'held') return s;

      const newState = s.state === 'selected' ? 'empty' : 'selected';
      return { ...s, state: newState };
    }));
  };

  // 5. Cập nhật tổng tiền khi ghế/combo thay đổi
  useEffect(() => {
    // ID các ghế đang chọn
    const currentSelectedIds = seats
      .filter(s => s.state === 'selected')
      .map(s => s.id);
    
    setSelectedSeatIds(currentSelectedIds);

    // Tính tiền ghế
    const seatTotal = seats
      .filter(s => s.state === 'selected')
      .reduce((sum, s) => sum + s.price, 0);

    // Tính tiền combo
    const comboPrice = combos.find(c => c._id === selectedCombo)?.price || 0;

    setTotal(seatTotal + comboPrice);
  }, [seats, selectedCombo, combos]);


  // 6. Submit đặt vé
  const handleSubmit = async () => {
    if (!selectedMovie || !selectedShowtime || selectedSeatIds.length === 0) {
      toast.warning("Vui lòng chọn đầy đủ thông tin!");
      return;
    }
    setLoading(true);
    try {
      await api.create("tickets", {
        movieId: selectedMovie,
        showtimeId: selectedShowtime,
        seats: selectedSeatIds,
        combo: selectedCombo || null,
        createdBy: "staff",
        status: "done" // Staff đặt là coi như thanh toán luôn tại quầy
      });
      
      toast.success("✅ Đặt vé thành công!");
      
      // Reset form
      setSelectedSeatIds([]);
      setSelectedCombo("");
      // Load lại ghế để cập nhật trạng thái booked
      const st = await api.getShowtime(selectedShowtime);
      if (st && st.seats) {
         // Logic reload ghế tương tự useEffect ở trên
         // Để đơn giản, ta trigger reload bằng cách set lại showtime (hoặc tách hàm load)
         // Ở đây reset về rỗng để nhân viên chọn suất khác hoặc chọn lại
         setSelectedShowtime(""); 
         setSeats([]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Lỗi khi đặt vé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
        🎟️ Đặt vé tại quầy
      </h1>

      {/* Form chọn thông tin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow border border-gray-200">
        <div>
          <label className="font-medium text-gray-700 text-sm">Phim</label>
          <select
            className="w-full border rounded-md p-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
          >
            <option value="">-- Chọn phim --</option>
            {movies.map((m) => (
              <option key={m._id || m.id} value={m._id || m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium text-gray-700 text-sm">Suất chiếu</label>
          <select
            className="w-full border rounded-md p-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedShowtime}
            onChange={(e) => setSelectedShowtime(e.target.value)}
            disabled={!selectedMovie}
          >
            <option value="">-- Chọn suất chiếu --</option>
            {showtimes.map((s) => {
              // --- SỬA ĐỔI TẠI ĐÂY ---
              // 1. Ép hiển thị theo UTC để giống hệt API (07:00Z -> 07:00)
              const timeDisplay = new Date(s.startTime).toLocaleTimeString('vi-VN', {
                hour: '2-digit', 
                minute: '2-digit', 
                timeZone: 'UTC' // <--- Giữ nguyên giờ gốc
              });

              // 2. Lấy tên phòng từ object room (Backend đã join)
              const roomName = s.room?.name || "Phòng ?";

              return (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {`${timeDisplay} - ${roomName}`}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="font-medium text-gray-700 text-sm">Combo (Tùy chọn)</label>
          <select
            className="w-full border rounded-md p-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCombo}
            onChange={(e) => setSelectedCombo(e.target.value)}
          >
            <option value="">-- Không chọn --</option>
            {combos.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name} ({c.price?.toLocaleString()}đ)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sơ đồ ghế */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 min-h-[400px]">
        {seats.length > 0 ? (
          <SeatMap 
            seats={seats}
            onToggle={handleToggleSeat}
            onToggleMany={(ids) => ids.forEach(id => handleToggleSeat(id))}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 italic">
            {selectedShowtime ? "Đang tải sơ đồ ghế..." : "Vui lòng chọn suất chiếu để hiển thị ghế"}
          </div>
        )}
      </div>

      {/* Footer: Thông tin & Thanh toán */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-700 space-y-1">
            <p>🎬 <b>Phim:</b> {movies.find((m) => (m._id || m.id) === selectedMovie)?.title || "--"}</p>
            <p>💺 <b>Ghế chọn:</b> {selectedSeatIds.length > 0 ? selectedSeatIds.join(", ") : "--"}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-500">Tổng cộng</p>
              <p className="text-2xl font-bold text-blue-600">{total.toLocaleString()} đ</p>
            </div>
            
            <button
              className="px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-transform active:scale-95"
              onClick={handleSubmit}
              disabled={loading || selectedSeatIds.length === 0}
            >
              {loading ? "Đang xử lý..." : "XUẤT VÉ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}