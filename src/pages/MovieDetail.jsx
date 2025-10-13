import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { apiGet } from "../lib/http"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { mockMovies } from "../mock/movies"

// Mock danh sách rạp & suất chiếu
const mockCinemas = [
  {
    id: 1,
    name: "CGV Vincom Đồng Khởi",
    city: "Hồ Chí Minh",
    showtimes: ["10:00", "13:00", "15:30", "18:00", "20:30"],
  },
  {
    id: 2,
    name: "Lotte Cinema Gò Vấp",
    city: "Hồ Chí Minh",
    showtimes: ["09:00", "11:30", "14:00", "16:30", "19:30"],
  },
  {
    id: 3,
    name: "Beta Mỹ Đình",
    city: "Hà Nội",
    showtimes: ["08:30", "12:00", "14:30", "17:00", "20:00"],
  },
]

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [selectedCinema, setSelectedCinema] = useState(null)
  const [selectedTime, setSelectedTime] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const base = import.meta.env.VITE_API_BASE_URL
        if (base) {
          const data = await apiGet(`/movies/${id}`)
          setMovie(data)
        } else {
          const found = mockMovies.find((m) => String(m.id) === id)
          setMovie(found)
        }
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [id])

  if (!movie) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-neutral-400">
        Loading...
      </div>
    )
  }

  function handleBooking() {
    if (!selectedCinema || !selectedTime) {
      alert("Vui lòng chọn rạp và giờ chiếu trước khi đặt vé!")
      return
    }
    // Lưu tạm lựa chọn để trang booking lấy lại
    localStorage.setItem(
      "selectedShowtime",
      JSON.stringify({
        cinema: selectedCinema,
        time: selectedTime,
      })
    )
    navigate(`/booking/${movie.id}`)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-dvh bg-neutral-950 text-neutral-100">
        {/* Ảnh nền */}
        <div className="relative aspect-[16/6] w-full overflow-hidden">
          <img
            src={movie.backdrop_path || movie.poster_path}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        </div>

        {/* Nội dung */}
        <div className="container mx-auto px-4 py-10 space-y-8">
          {/* Thông tin phim */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold">{movie.title}</h1>
            <p className="text-neutral-400">
              Release date: {movie.release_date || "Unknown"} | Rating:{" "}
              {movie.vote_average}
            </p>
            <p className="text-neutral-300 max-w-2xl">
              {movie.overview ||
                "Hiện chưa có mô tả cho bộ phim này. Cập nhật sau..."}
            </p>
          </div>

          {/* Lịch chiếu theo rạp */}
          <div>
            <h2 className="text-2xl font-bold mb-4">🎭 Lịch chiếu tại các rạp</h2>
            <div className="space-y-6">
              {mockCinemas.map((cinema) => (
                <div
                  key={cinema.id}
                  className="border border-neutral-800 rounded-xl p-4 hover:bg-neutral-900 transition"
                >
                  <h3 className="font-semibold text-lg mb-2">
                    {cinema.name}{" "}
                    <span className="text-sm text-neutral-400">
                      ({cinema.city})
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cinema.showtimes.map((time) => {
                      const selected =
                        selectedCinema?.id === cinema.id &&
                        selectedTime === time
                      return (
                        <button
                          key={time}
                          onClick={() => {
                            setSelectedCinema(cinema)
                            setSelectedTime(time)
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                            selected
                              ? "bg-rose-600 border-rose-600 text-white"
                              : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                          }`}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nút hành động */}
          <div className="pt-6 border-t border-neutral-800 flex flex-wrap gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition"
            >
              ← Back
            </button>
            <button
              onClick={handleBooking}
              className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
            >
              🎟️ Đặt vé ngay
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
