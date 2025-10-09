export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur border-b border-neutral-800">
      <div className="container mx-auto flex items-center gap-4 px-4 py-3">
        <a href="/" className="text-xl font-extrabold tracking-tight">
          <span className="text-rose-500">Cine</span>sta
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
          <a className="hover:text-white" href="#now">Now Playing</a>
          <a className="hover:text-white" href="#popular">Popular</a>
          <a className="hover:text-white" href="#top">Top Rated</a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <input
            type="search"
            placeholder="Search movies..."
            className="bg-neutral-900 rounded-xl px-4 py-2 text-sm outline-none ring-1 ring-neutral-800 focus:ring-rose-600 transition w-56"
          />
          <button className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium">
            Sign in
          </button>
        </div>
      </div>
    </header>
  )
}
