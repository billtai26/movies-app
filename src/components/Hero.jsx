import { Link } from "react-router-dom" // 🟢 thêm dòng này

function Skeleton() {
  return (
    <div className="aspect-[16/6] w-full animate-pulse bg-neutral-900 rounded-2xl" />
  )
}

export default function Hero({ movie, loading }) {
  if (loading) return <div className="container mx-auto px-4"><Skeleton /></div>
  if (!movie) return null

  return (
    <section className="container mx-auto px-4">
      <div
        className="relative aspect-[16/6] w-full overflow-hidden rounded-3xl"
      >
        <img
          src={movie.backdrop_path || movie.poster_path}
          alt={movie.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
          <h1 className="max-w-3xl text-3xl md:text-5xl font-black leading-tight">
            {movie.title}
          </h1>
          <p className="mt-3 text-neutral-300 line-clamp-2">Watch the latest blockbuster hit in stunning 4K.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-neutral-900 font-semibold">Play
            </button>

            {/* 🔽 Cập nhật nút More Info */}
            <Link
              to={`/movie/${movie.id}`}
              className="px-5 py-2.5 rounded-xl ring-1 ring-white/40 hover:ring-white/80 text-white font-semibold transition"
            >
              More Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
