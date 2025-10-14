import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

function Star({ filled }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      className="size-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.038a1 1 0 00-.364 1.118l1.07 3.291c.3.922-.755 1.688-1.54 1.118l-2.802-2.038a1 1 0 00-1.175 0l-2.802 2.038c-.784.57-1.838-.196-1.539-1.118l1.07-3.291a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  )
}

export default function MovieCard({ movie }) {
  const rating = Math.round((movie.vote_average || 0) / 2) // 0..10 -> 0..5
  const [inWatchlist, setInWatchlist] = useState(false)

  // 🧠 Kiểm tra xem phim đã có trong watchlist chưa
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("watchlist") || "[]")
    setInWatchlist(list.some((m) => m.id === movie.id))
  }, [movie.id])

  // ❤️ Thêm / Xóa khỏi Watchlist
  function toggleWatchlist() {
    const list = JSON.parse(localStorage.getItem("watchlist") || "[]")
    let updated
    if (inWatchlist) {
      updated = list.filter((m) => m.id !== movie.id)
    } else {
      updated = [...list, movie]
    }
    localStorage.setItem("watchlist", JSON.stringify(updated))
    setInWatchlist(!inWatchlist)
  }

  return (
    <div className="group relative w-40 shrink-0 md:w-48 lg:w-52">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-neutral-900">
        {/* 🖼️ Hình ảnh phim */}
        {movie.poster_path ? (
          <Link to={`/movie/${movie.id}`}>
            <img
              src={movie.poster_path}
              alt={movie.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </Link>
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-500">
            No Image
          </div>
        )}

        {/* Viền mờ */}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />

        {/* Nút Watchlist */}
        <button
          onClick={toggleWatchlist}
          className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs backdrop-blur transition ${
            inWatchlist
              ? "bg-rose-600 text-white"
              : "bg-neutral-900/70 text-white/80 hover:bg-rose-600 hover:text-white"
          }`}
        >
          {inWatchlist ? "✓ Added" : "+ Watchlist"}
        </button>
      </div>

      {/* Thông tin phim */}
      <div className="mt-3 space-y-1">
        <Link
          to={`/movie/${movie.id}`}
          className="line-clamp-2 text-sm font-semibold hover:text-rose-400 transition"
        >
          {movie.title}
        </Link>
        <div className="flex items-center gap-1 text-amber-400">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} filled={i < rating} />
          ))}
          <span className="ml-1 text-xs text-neutral-400">
            {(movie.vote_average || 0).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}
