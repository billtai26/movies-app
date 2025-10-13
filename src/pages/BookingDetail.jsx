import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("bookings") || "[]")
    const found = saved.find((b) => String(b.id) === id)
    setBooking(found)
  }, [id])

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="min-h-[70vh] flex items-center justify-center text-neutral-400">
          Không tìm thấy thông tin vé.
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
          <h1 className="text-2xl font-bold mb-4">🎬 Chi tiết vé #{booking.id}</h1>
          <div className="space-y-2 text-sm text-neutral-300 text-left">
            <p><strong>Phim:</strong> {booking.movieTitle}</p>
            <p><strong>Rạp:</strong> {booking.cinema}</p>
            <p><strong>Ngày:</strong> {booking.date}</p>
            <p><strong>Suất chiếu:</strong> {booking.time}</p>
            <p><strong>Ghế:</strong> {booking.seats.join(", ")}</p>
            <p><strong>Phương thức thanh toán:</strong> {booking.payment}</p>
            <p><strong>Tổng tiền:</strong> {booking.total.toLocaleString()}₫</p>
          </div>
          <button
            onClick={() => navigate("/bookings")}
            className="mt-6 px-5 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-white font-semibold"
          >
            ← Quay lại lịch sử
          </button>
        </div>
      </div>
      <Footer />
    </>
  )
}
