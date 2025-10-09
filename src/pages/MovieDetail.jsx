import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { apiGet } from "../lib/http"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { mockMovies } from "../mock/movies"

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const base = import.meta.env.VITE_API_BASE_URL
        if (base) {
          const data = await apiGet(`/movies/${id}`)
          setMovie(data)
        } else {
          // fallback mock
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
    return <div className="min-h-dvh flex items-center justify-center text-neutral-400">Loading...</div>
  }

  return (
    <>
      <Navbar />
      <div className="min-h-dvh bg-neutral-950 text-neutral-100">
        <div
          className="relative aspect-[16/6] w-full overflow-hidden"
        >
          <img
            src={movie.backdrop_path}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 py-10 space-y-4">
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          <p className="text-neutral-400">
            Release date: {movie.release_date || "Unknown"} | Rating: {movie.vote_average}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white"
          >
            ← Back
          </button>
        </div>
      </div>
      <Footer />
    </>
  )
}
