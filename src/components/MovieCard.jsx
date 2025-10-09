function Star({ filled }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.038a1 1 0 00-.364 1.118l1.07 3.291c.3.922-.755 1.688-1.54 1.118l-2.802-2.038a1 1 0 00-1.175 0l-2.802 2.038c-.784.57-1.838-.196-1.539-1.118l1.07-3.291a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export default function MovieCard({ movie }) {
  const rating = Math.round((movie.vote_average || 0) / 2) // 0..10 -> 0..5

  return (
    <div className="group relative w-40 shrink-0 md:w-48 lg:w-52">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-neutral-900">
        {movie.poster_path ? (
          <img
            src={movie.poster_path}
            alt={movie.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-500">No Image</div>
        )}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>
      <div className="mt-3">
        <h3 className="line-clamp-2 text-sm font-semibold">{movie.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-amber-400">
          {Array.from({ length: 5 }, (_, i) => <Star key={i} filled={i < rating} />)}
          <span className="ml-1 text-xs text-neutral-400">{(movie.vote_average || 0).toFixed(1)}</span>
        </div>
      </div>
      <button className="absolute right-2 top-2 rounded-full bg-neutral-900/70 px-2 py-1 text-xs opacity-0 backdrop-blur transition group-hover:opacity-100">+ Watchlist</button>
    </div>
  )
}
