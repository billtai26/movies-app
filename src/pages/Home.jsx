import { useEffect, useMemo, useState } from "react"
import { apiGet } from "../lib/http"
import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import MovieRow from "../components/MovieRow"
import Footer from "../components/Footer"
import { mockMovies } from "../mock/movies"

/**
 * Cinesta-like Home page
 * Sections: Hero (Featured), Rows: Now Playing, Popular, Top Rated
 * Ready to plug API endpoints later.
 */
export default function Home() {
  const [popular, setPopular] = useState([])
  const [nowPlaying, setNowPlaying] = useState([])
  const [topRated, setTopRated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let canceled = false
    async function load() {
      setLoading(true)
      try {
        // If VITE_API_BASE_URL is not set, mock data will be used
        const base = import.meta.env.VITE_API_BASE_URL
        if (base) {
          const [p, n, t] = await Promise.all([
            apiGet("/movies/popular", { page: 1 }),
            apiGet("/movies/now-playing", { page: 1 }),
            apiGet("/movies/top-rated", { page: 1 }),
          ])
          if (!canceled) {
            setPopular(p.results || p || [])
            setNowPlaying(n.results || n || [])
            setTopRated(t.results || t || [])
          }
        } else {
          // fallback mock
          if (!canceled) {
            setPopular(mockMovies)
            setNowPlaying(mockMovies.slice().reverse())
            setTopRated(mockMovies.slice(0, 2))
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (!canceled) setLoading(false)
      }
    }
    load()
    return () => (canceled = true)
  }, [])

  const featured = useMemo(() => (popular && popular.length ? popular[0] : null), [popular])

  return (
    <div>
      <Navbar />
      <main className="space-y-10">
        <Hero movie={featured} loading={loading} />
        <section className="container mx-auto px-4 space-y-12">
          <MovieRow title="Now Playing" movies={nowPlaying} loading={loading} />
          <MovieRow title="Popular" movies={popular} loading={loading} />
          <MovieRow title="Top Rated" movies={topRated} loading={loading} />
        </section>
      </main>
      <Footer />
    </div>
  )
}
