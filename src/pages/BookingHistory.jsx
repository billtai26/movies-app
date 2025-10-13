import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function BookingHistory() {
  const [bookings, setBookings] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Giả lập lấy dữ liệu từ localStorage hoặc API
    const saved = JSON.parse(localStorage.getItem("bookings") || "[]")
    setBookings(saved)
  }, [])

  function handleViewDetail(id) {
    navigate(`/bookings/${id}`)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[80vh] bg-neutral-950 text-white px-4 py-10">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">🎟️ Lịch sử đặt vé</h1>

          {bookings.length === 0 ? (
            <div className="text-center text-neutral-400 mt-20">
              <p>Bạn chưa có vé nào được đặt.</p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 px-6 py-2 bg-rose-600 hover:bg-rose-500 rounded-lg font-semibold"
              >
                Đặt vé ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="border border-neutral-800 rounded-xl p-4 hover:bg-neutral-900 transition cursor-pointer"
                  onClick={() => handleViewDetail(b.id)}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-2">
                    <div>
                      <h2 className="font-bold text-xl">{b.movieTitle}</h2>
                      <p className="text-neutral-400 text-sm">
                        {b.cinema} — {b.date} — {b.time}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        Ghế: {b.seats.join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-rose-500">
                        {b.total.toLocaleString()}₫
                      </p>
                      <p className="text-xs text-neutral-400">
                        Thanh toán: {b.payment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
