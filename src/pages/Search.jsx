import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { apiGet } from "../lib/http"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import MovieCard from "../components/MovieCard"
import { mockMovies } from "../mock/movies"

export default function Search() {
  const [params] = useSearchParams()
  const query = params.get("query") || ""
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) return
    async function search() {
      setLoading(true)
      try {
        const base = import.meta.env.VITE_API_BASE_URL
        if (base) {
          const data = await apiGet("/search", { query })
          setResults(data.results || data)
        } else {
          // fallback: filter mock
          setResults(
            mockMovies.filter((m) =>
              m.title.toLowerCase().includes(query.toLowerCase())
            )
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    search()
  }, [query])

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Search results for "{query}"</h1>
        {loading ? (
          <p>Loading...</p>
        ) : results.length === 0 ? (
          <p>No movies found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {results.map((m) => <MovieCard key={m.id} movie={m} />)}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
