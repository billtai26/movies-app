import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { mockMovies } from "../mock/movies"

const mockCinemas = [
  { id: 1, name: "CGV Vincom Đồng Khởi", city: "Hồ Chí Minh" },
  { id: 2, name: "Lotte Cinema Gò Vấp", city: "Hồ Chí Minh" },
  { id: 3, name: "Beta Mỹ Đình", city: "Hà Nội" },
]

const mockShowtimes = ["10:00", "13:00", "15:30", "18:00", "20:30"]

const mockSeats = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  label: `A${i + 1}`,
  booked: Math.random() < 0.2, // random ghế đã đặt
}))

export default function Booking() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [cinema, setCinema] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [selectedSeats, setSelectedSeats] = useState([])
  const [payment, setPayment] = useState("")
  const [ticketPrice] = useState(75000) // Giá vé giả định 75k/ghế

  useEffect(() => {
    // Lấy phim theo id
    const found = mockMovies.find((m) => String(m.id) === movieId)
    setMovie(found)

    // Lấy rạp & giờ chiếu nếu có chọn từ trang MovieDetail
    const saved = JSON.parse(localStorage.getItem("selectedShowtime") || "null")
    if (saved) {
      setCinema(saved.cinema.name)
      setTime(saved.time)
    }
  }, [movieId])

  function toggleSeat(seat) {
    if (seat.booked) return
    setSelectedSeats((prev) =>
      prev.includes(seat.id)
        ? prev.filter((id) => id !== seat.id)
        : [...prev, seat.id]
    )
  }

  function handleConfirm() {
    if (!cinema || !date || !time || selectedSeats.length === 0 || !payment) {
      alert("Vui lòng chọn đầy đủ thông tin trước khi đặt vé!")
      return
    }

    const booking = {
      movie,
      cinema,
      date,
      time,
      seats: selectedSeats,
      total: selectedSeats.length * ticketPrice,
      payment,
    }

    // Sau này gửi qua API
    localStorage.setItem("lastBooking", JSON.stringify(booking))
    navigate("/booking/confirmation")
  }

  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split("T")[0]
  })

  return (
    <>
      <Navbar />
      <div className="min-h-[80vh] bg-neutral-950 text-white px-4 py-10">
        {movie ? (
          <div className="container mx-auto space-y-8">
            {/* Phần phim */}
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={movie.poster_path}
                alt={movie.title}
                className="w-40 md:w-52 rounded-xl"
              />
              <div>
                <h1 className="text-3xl font-bold">{movie.title}</h1>
                <p className="text-neutral-400 mt-2">
                  Rating: {movie.vote_average} | Release: {movie.release_date}
                </p>
              </div>
            </div>

            {/* Chọn rạp */}
            <div>
              <h2 className="font-semibold mb-2 text-lg">1️⃣ Chọn rạp</h2>
              <select
                className="bg-neutral-900 px-4 py-2 rounded-lg w-full md:w-1/2"
                value={cinema}
                onChange={(e) => setCinema(e.target.value)}
              >
                <option value="">-- Chọn rạp chiếu --</option>
                {mockCinemas.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn ngày + giờ */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h2 className="font-semibold mb-2 text-lg">2️⃣ Chọn ngày</h2>
                <div className="flex gap-2 flex-wrap">
                  {dates.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDate(d)}
                      className={`px-3 py-2 rounded-lg border transition ${
                        date === d
                          ? "bg-rose-600 border-rose-600"
                          : "border-neutral-700 hover:bg-neutral-800"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-semibold mb-2 text-lg">3️⃣ Chọn giờ chiếu</h2>
                <div className="flex gap-2 flex-wrap">
                  {mockShowtimes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={`px-3 py-2 rounded-lg border transition ${
                        time === t
                          ? "bg-rose-600 border-rose-600"
                          : "border-neutral-700 hover:bg-neutral-800"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chọn ghế */}
            <div>
              <h2 className="font-semibold mb-2 text-lg">4️⃣ Chọn ghế</h2>
              <div className="grid grid-cols-8 gap-3 max-w-md">
                {mockSeats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => toggleSeat(seat)}
                    disabled={seat.booked}
                    className={`h-10 rounded-md text-sm font-medium transition ${
                      seat.booked
                        ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                        : selectedSeats.includes(seat.id)
                        ? "bg-rose-600 text-white"
                        : "bg-neutral-800 hover:bg-neutral-700"
                    }`}
                  >
                    {seat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tổng tiền + thanh toán */}
            <div className="pt-6 border-t border-neutral-800 space-y-4">
              <h2 className="font-semibold text-lg">5️⃣ Thanh toán</h2>

              <div className="flex gap-3 flex-wrap">
                {["Momo", "VNPay", "Tiền mặt"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPayment(method)}
                    className={`px-4 py-2 rounded-lg border transition ${
                      payment === method
                        ? "bg-rose-600 border-rose-600 text-white"
                        : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <div className="text-neutral-300">
                <p>🎟️ Số ghế đã chọn: {selectedSeats.length}</p>
                <p>
                  💰 Tổng tiền:{" "}
                  <span className="text-rose-500 font-semibold">
                    {(selectedSeats.length * ticketPrice).toLocaleString()}₫
                  </span>
                </p>
              </div>

              <button
                onClick={handleConfirm}
                className="mt-4 px-6 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl font-semibold"
              >
                Xác nhận đặt vé
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-neutral-400">Loading movie...</p>
        )}
      </div>
      <Footer />
    </>
  )
}
