import React, { useState, useEffect } from "react";
import SeatMap from "../../components/SeatMap";
import { api } from "../../../lib/api";
import { toast } from "react-toastify";

// Định nghĩa lại các type tương thích với SeatMap
type SeatState = 'empty'|'held'|'booked'|'selected';
type Seat = { 
  id: string; 
  row: string; 
  col: number; 
  type: 'normal'|'vip'|'couple'; 
  state: SeatState; 
  price: number; 
};

export default function SeatChange() {
  const [ticketCode, setTicketCode] = useState("");
  const [ticket, setTicket] = useState<any | null>(null);
  
  // State quản lý danh sách tất cả các ghế để hiển thị lên Map
  const [seats, setSeats] = useState<Seat[]>([]);
  
  // Danh sách ID các ghế MỚI được chọn để đổi
  const [newSelectedIds, setNewSelectedIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);

  // 🔍 1. Tìm vé và tải sơ đồ ghế
  const handleFind = async () => {
    if (!ticketCode.trim()) {
      toast.warning("Vui lòng nhập mã vé!");
      return;
    }
    setLoading(true);
    setTicket(null);
    setSeats([]);
    setNewSelectedIds([]);

    try {
      // B1: Lấy thông tin vé
      const t = await api.getTicket(ticketCode);
      if (!t || (!t._id && !t.id)) {
        throw new Error("Không tìm thấy thông tin vé");
      }
      setTicket(t);

      // B2: Lấy thông tin suất chiếu (showtime) để có sơ đồ ghế
      const showtimeId = t.showtimeId || t.showtime?._id;
      if (showtimeId) {
        const st = await api.getShowtime(showtimeId);
        if (st && st.seats) {
          // Map dữ liệu từ API sang format của SeatMap component
          const mapData: Seat[] = st.seats.map((s: any) => {
            // Tách hàng/cột từ seatNumber (VD: "A12" -> Row A, Col 12)
            const rowMatch = s.seatNumber.match(/[A-Z]+/);
            const colMatch = s.seatNumber.match(/\d+/);
            const row = rowMatch ? rowMatch[0] : "A";
            const col = colMatch ? parseInt(colMatch[0]) : 1;

            // Xác định trạng thái ghế
            // Ghế đã đặt (booked) sẽ không chọn được
            let state: SeatState = 'empty';
            if (s.status === 'booked') state = 'booked';
            if (s.heldBy) state = 'held';

            return {
              id: s.seatNumber,
              row,
              col,
              type: s.type || 'normal',
              state,
              price: s.price
            };
          });
          setSeats(mapData);
        }
      } else {
        toast.error("Vé không có thông tin suất chiếu hợp lệ.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(`Lỗi: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🖱️ Xử lý khi click vào ghế
  const handleToggleSeat = (seatId: string) => {
    setSeats(prev => prev.map(s => {
      if (s.id !== seatId) return s;
      
      // Nếu ghế đang trống -> Chọn
      if (s.state === 'empty') {
        return { ...s, state: 'selected' };
      }
      // Nếu đang chọn -> Bỏ chọn
      if (s.state === 'selected') {
        return { ...s, state: 'empty' };
      }
      return s;
    }));
  };

  // Cập nhật danh sách ID ghế mới mỗi khi seats thay đổi
  useEffect(() => {
    const ids = seats.filter(s => s.state === 'selected').map(s => s.id);
    setNewSelectedIds(ids);
  }, [seats]);

  // 🔁 2. Gửi yêu cầu đổi ghế
  const handleChange = async () => {
    if (!ticket) return;
    
    // Kiểm tra số lượng ghế mới có khớp ghế cũ không (tuỳ logic nghiệp vụ)
    const oldSeatsCount = Array.isArray(ticket.seats) ? ticket.seats.length : ticket.seats.split(',').length;
    if (newSelectedIds.length === 0) {
      toast.warning("Vui lòng chọn ghế mới!");
      return;
    }
    // Nếu muốn bắt buộc số lượng bằng nhau:
    if (newSelectedIds.length !== oldSeatsCount) {
       toast.warning(`Vui lòng chọn đúng ${oldSeatsCount} ghế mới (Đang chọn: ${newSelectedIds.length})`);
       return;
    }

    setLoading(true);
    try {
      const ticketId = ticket._id || ticket.id;
      // Gọi API update vé
      await api.update("tickets", ticketId, { seats: newSelectedIds });
      
      toast.success("✅ Đổi ghế thành công!");
      
      // Reset form
      setTicket(null);
      setTicketCode("");
      setSeats([]);
      setNewSelectedIds([]);
    } catch (e: any) {
      console.error(e);
      toast.error(`Lỗi đổi ghế: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ĐÃ SỬA: Xóa 'max-w-5xl mx-auto', thay bằng 'w-full' để căn trái và full màn hình
    <div className="p-6 space-y-6 w-full">
      <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
        🔁 Đổi ghế tại quầy
      </h1>

      {/* Input tìm vé */}
      {/* ĐÃ SỬA: Thêm 'w-fit' để khung trắng bao quanh input gọn lại, không bị kéo dài hết màn hình */}
      <div className="flex gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-fit">
        <input
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          placeholder="Nhập mã vé (VD: X8J92K)"
          className="border rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleFind()}
        />
        <button
          onClick={handleFind}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
        >
          {loading ? "Đang tìm..." : "Tìm vé"}
        </button>
      </div>

      {ticket && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Thông tin vé cũ */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between gap-4 shadow-sm">
            <div>
              <h3 className="font-bold text-blue-800 text-lg mb-1">
                {ticket.movie?.title || ticket.movieTitle || "Tên phim"}
              </h3>
              <p className="text-blue-600 text-sm flex items-center gap-2">
                🕒 {ticket.showtime?.startTime 
                  ? new Date(ticket.showtime.startTime).toLocaleString('vi-VN') 
                  : "---"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-sm">Ghế hiện tại</div>
              <div className="font-bold text-xl text-gray-800">
                {Array.isArray(ticket.seats) ? ticket.seats.join(", ") : ticket.seats}
              </div>
            </div>
          </div>

          {/* Sơ đồ ghế */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-700">Chọn ghế mới</h3>
              <div className="text-sm">
                Đang chọn: <span className="font-bold text-orange-600">{newSelectedIds.join(", ")}</span>
              </div>
            </div>
            
            {/* Render SeatMap với đúng Props */}
            {seats.length > 0 ? (
              <SeatMap
                seats={seats}
                onToggle={handleToggleSeat}
                onToggleMany={(ids) => ids.forEach(id => handleToggleSeat(id))}
              />
            ) : (
              <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                Không tải được sơ đồ ghế hoặc suất chiếu không tồn tại.
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleChange}
              disabled={loading || newSelectedIds.length === 0}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đổi ghế"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}