import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function Navbar() {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?query=${encodeURIComponent(query.trim())}`)
    setQuery("")
  }

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur border-b border-neutral-800">
      <div className="container mx-auto flex flex-wrap items-center gap-4 px-4 py-3">
        {/* 🔥 Logo */}
        <a
          href="/"
          className="text-xl font-extrabold tracking-tight text-white hover:text-rose-500 transition"
        >
          <span className="text-rose-500">Cine</span>sta
        </a>

        {/* 🎬 Menu (ẩn trên mobile) */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
          <a className="hover:text-white" href="#now">
            Now Playing
          </a>
          <a className="hover:text-white" href="#popular">
            Popular
          </a>
          <a className="hover:text-white" href="#top">
            Top Rated
          </a>
        </nav>

        {/* 🔎 Thanh tìm kiếm */}
        <form
          onSubmit={handleSubmit}
          className="ml-auto flex items-center gap-3"
        >
          <input
            type="search"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-neutral-900 rounded-xl px-4 py-2 text-sm outline-none ring-1 ring-neutral-800 focus:ring-rose-600 transition w-56 text-white placeholder-neutral-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium"
          >
            Search
          </button>
        </form>

        {/* ❤️ Nút My Watchlist */}
        <button
          onClick={() => navigate("/watchlist")}
          className="hidden sm:inline px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium"
        >
          My Watchlist
        </button>

        {/* 👤 Nút Sign in */}
        <button
          onClick={() => navigate("/login")}
          className="hidden sm:inline px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-sm font-medium"
        >
          Sign in
        </button>
        {/* 👤 Lịch sử vé */}
        <button
          onClick={() => navigate("/bookings")}
          className="hidden sm:inline px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium"
        >
          Vé của tôi
        </button>

      </div>
    </header>
  )
}
