import MovieCard from "./MovieCard"

function RowSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-thin">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[300px] w-40 md:w-48 lg:w-52 shrink-0 rounded-xl bg-neutral-900 animate-pulse" />
      ))}
    </div>
  )
}

export default function MovieRow({ title, movies = [], loading }) {
  return (
    <section aria-label={title} className="space-y-3">
      <h2 className="text-lg md:text-2xl font-bold">{title}</h2>
      {loading ? (
        <RowSkeleton />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      )}
    </section>
  )
}
