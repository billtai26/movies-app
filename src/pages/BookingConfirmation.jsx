import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function BookingConfirmation() {
  const [booking, setBooking] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("lastBooking") || "null")

    if (data) {
      setBooking(data)

      // --- Lưu vé vào lịch sử (nếu chưa có) ---
      const all = JSON.parse(localStorage.getItem("bookings") || "[]")
      const exists = all.find((b) => b.id === data.id)
      if (!exists) {
        all.push(data)
        localStorage.setItem("bookings", JSON.stringify(all))
      }
    }
  }, [])

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="min-h-[70vh] flex items-center justify-center text-neutral-400">
          Không tìm thấy thông tin đặt vé.
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[80vh] bg-neutral-950 text-white flex flex-col items-center justify-center px-4 py-10">
        <div className="bg-neutral-900 p-8 rounded-2xl w-full max-w-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">🎉 Đặt vé thành công!</h1>
          <p className="text-neutral-300 mb-4">
            Cảm ơn bạn đã đặt vé xem phim tại <span className="text-rose-500 font-semibold">Cinesta</span>.
          </p>

          <div className="space-y-2 text-sm text-neutral-300 text-left border-t border-neutral-800 pt-4">
            <p><strong>🎬 Phim:</strong> {booking.movie.title}</p>
            <p><strong>🏢 Rạp:</strong> {booking.cinema}</p>
            <p><strong>📅 Ngày:</strong> {booking.date}</p>
            <p><strong>🕒 Suất chiếu:</strong> {booking.time}</p>
            <p><strong>💺 Ghế:</strong> {booking.seats.join(", ")}</p>
            {booking.payment && (
              <p><strong>💳 Thanh toán:</strong> {booking.payment}</p>
            )}
            {booking.total && (
              <p>
                <strong>💰 Tổng tiền:</strong>{" "}
                <span className="text-rose-500 font-semibold">
                  {booking.total.toLocaleString()}₫
                </span>
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-white font-semibold transition"
            >
              ⏮️ Về trang chủ
            </button>

            <button
              onClick={() => navigate("/bookings")}
              className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-white font-semibold transition"
            >
              🧾 Xem lịch sử vé
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
