import { useRef, useState } from "react"
import MovieCard from "./MovieCard"
import { ChevronLeft, ChevronRight } from "lucide-react" // 🟢 icon (đã có sẵn trong shadcn/lucide-react)

function RowSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-thin">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[300px] w-40 md:w-48 lg:w-52 shrink-0 rounded-xl bg-neutral-900 animate-pulse"
        />
      ))}
    </div>
  )
}

export default function MovieRow({ title, movies = [], loading }) {
  const [visible, setVisible] = useState(1)
  const scrollRef = useRef(null)

  const moviesToShow = movies.slice(0, visible * 6)

  function handleScroll(e) {
    const el = e.target
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 100) {
      setVisible((v) => v + 1)
    }
  }

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" })
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" })
  }

  return (
    <section aria-label={title} className="relative space-y-3 group">
      <h2 className="text-lg md:text-2xl font-bold">{title}</h2>

      {loading ? (
        <RowSkeleton />
      ) : movies.length === 0 ? (
        <p className="text-neutral-500 italic">No movies available.</p>
      ) : (
        <div className="relative">
          {/* 🟢 Nút mũi tên trái */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-neutral-900/60 hover:bg-neutral-900/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft className="text-white size-5" />
          </button>

          {/* 🟢 Danh sách phim */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scroll-smooth"
          >
            {moviesToShow.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>

          {/* 🟢 Nút mũi tên phải */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-neutral-900/60 hover:bg-neutral-900/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight className="text-white size-5" />
          </button>
        </div>
      )}
    </section>
  )
}
