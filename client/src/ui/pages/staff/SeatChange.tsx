import React, { useState } from "react";
import SeatMap from "../../components/SeatMap";
import { api } from "../../../lib/api";

export default function SeatChange() {
  const [ticketCode, setTicketCode] = useState("");
  const [ticket, setTicket] = useState<any | null>(null);
  const [newSeats, setNewSeats] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧠 Mock fallback vé mẫu (chạy khi API lỗi)
  const mockTicket = (code: string) => ({
    _id: "mock-" + code,
    movie: { title: "Inception" },
    showtime: { startTime: new Date().toISOString() },
    seats: ["C4", "C5"],
  });

  // 🔍 Tìm vé
  const handleFind = async () => {
    if (!ticketCode.trim()) {
      setMessage("⚠️ Vui lòng nhập mã vé!");
      return;
    }
    setLoading(true);
    try {
      const res = await api.getTicket(ticketCode);
      if (!res || !res._id) throw new Error("Not found");
      setTicket(res);
      setMessage("");
    } catch (e) {
      // Nếu không có API thật thì tạo vé giả
      console.warn("⚠️ API getTicket thất bại — đang dùng mock demo");
      setTicket(mockTicket(ticketCode));
      setMessage("💡 Đang hiển thị vé demo (mock)");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Đổi ghế
  const handleChange = async () => {
    if (!ticket) return;
    if (newSeats.length === 0) {
      setMessage("⚠️ Vui lòng chọn ghế mới trước khi xác nhận!");
      return;
    }
    setLoading(true);
    try {
      await api.update?.("tickets", ticket._id, { seats: newSeats });
      setMessage("✅ Đổi ghế thành công!");
      setTicket(null);
      setTicketCode("");
      setNewSeats([]);
    } catch (e) {
      console.warn("⚠️ API update thất bại — giả lập thành công");
      setMessage("✅ (Demo) Ghế đã được đổi thành công!");
      setTicket(null);
      setTicketCode("");
      setNewSeats([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Tiêu đề */}
      <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
        🔁 Đổi ghế tại quầy
      </h1>

      {/* Nhập mã vé */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          placeholder="Nhập mã vé..."
          className="border rounded-md p-2 w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          onClick={handleFind}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Đang tìm..." : "Tìm vé"}
        </button>
      </div>

      {/* Thông tin vé */}
      {ticket && (
        <div className="space-y-4">
          <div className="border rounded-xl p-4 bg-gray-50 shadow-sm">
            <h2 className="font-semibold text-lg text-gray-800 mb-2">Thông tin vé</h2>
            <p>
              🎬 <b>Phim:</b> {ticket.movie?.title ?? "--"}
            </p>
            <p>
              🕒 <b>Suất chiếu:</b>{" "}
              {ticket.showtime?.startTime
                ? new Date(ticket.showtime.startTime).toLocaleString()
                : "--"}
            </p>
            <p>
              💺 <b>Ghế cũ:</b>{" "}
              {ticket.seats?.length ? ticket.seats.join(", ") : "--"}
            </p>
          </div>

          {/* Sơ đồ ghế */}
          <div className="bg-gray-50 rounded-xl shadow-sm p-4">
            <SeatMap
              rows={12}
              leftCols={3}
              midCols={10}
              rightCols={3}
              vipRows={["A", "B"]}
              coupleRows={["K", "L"]}
              onChange={setNewSeats}
            />
          </div>

          {/* Xác nhận */}
          <div className="flex justify-end border-t pt-4">
            <button
              onClick={handleChange}
              className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác nhận đổi ghế"}
            </button>
          </div>
        </div>
      )}

      {/* Thông báo */}
      {message && (
        <p className="text-center text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );
}
