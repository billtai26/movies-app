import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import MovieCard from "../components/MovieCard"

export default function Watchlist() {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("watchlist") || "[]")
    setMovies(list)
  }, [])

  function clearWatchlist() {
    localStorage.removeItem("watchlist")
    setMovies([])
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🎬 My Watchlist</h1>
          {movies.length > 0 && (
            <button
              onClick={clearWatchlist}
              className="text-sm px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white"
            >
              Clear all
            </button>
          )}
        </div>

        {movies.length === 0 ? (
          <p className="text-neutral-500 italic">No movies added yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
