import React from "react";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import SidebarMovieCard from "../../components/SidebarMovieCard";
import QuickBooking from "../../components/QuickBooking";

export default function MovieGenres() {
  const [movies, setMovies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [genreList, setGenreList] = React.useState<any[]>([]);
  const [genreOptions, setGenreOptions] = React.useState<{value:string,label:string}[]>([]);

  const [genre, setGenre] = React.useState<string>("Tất cả");
  const [country, setCountry] = React.useState<string>("Tất cả");
  const [year, setYear] = React.useState<string>("2025");
  const [status, setStatus] = React.useState<string>("now");
  const [sort, setSort] = React.useState<string>("Xem Nhiều Nhất");

  React.useEffect(() => {
    setLoading(true);
    const statusParam = status === 'now' ? 'now_showing' : (status === 'coming' ? 'coming_soon' : undefined);
    const params: any = {};
    if (statusParam) params.status = statusParam;
    if (genre && genre !== 'Tất cả') {
      const found = genreList.find((g:any)=> (g.name===genre) || (g.slug===genre) || (String(g.id)===String(genre)) )
      const val = found ? (found.slug || found.name || found.id) : genre
      params.genre = val
    }
    if (country && country !== 'Tất cả') params.country = country;
    if (year) params.year = year;
    if (sort) params.sort = (sort === 'Xem Nhiều Nhất') ? 'popular' : 'latest';
    api.listMovies(params)
      .then((data: any) => {
        const arr = data?.movies || data || [];
        setMovies(Array.isArray(arr) ? arr : []);
      })
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [genre, country, year, status, sort, genreList]);

  React.useEffect(() => {
    api.listGenres()
      .then((data: any) => {
        const arr = data?.genres || data || [];
        setGenreList(Array.isArray(arr) ? arr : []);
      })
      .catch(() => setGenreList([]));
  }, []);

  React.useEffect(() => {
    const fromApi = (genreList || []).map((g:any)=> ({ value: g.slug || g.name || g.id, label: g.name || g.label || g.slug || String(g.id) }))
    const fromMoviesSet = new Set<string>()
    movies.forEach((m:any)=>{
      const arr = Array.isArray(m.genres) ? m.genres : (typeof m.genres === 'string' ? m.genres.split(',').map((x:string)=>x.trim()) : [])
      arr.forEach((x:string)=>{ if (x) fromMoviesSet.add(x) })
    })
    const fromMovies = Array.from(fromMoviesSet).map((x)=> ({ value: x, label: x }))
    const seen = new Set<string>()
    const merged: {value:string,label:string}[] = []
    ;[...fromApi, ...fromMovies].forEach(opt=>{ const k = String(opt.label).toLowerCase(); if (!seen.has(k)){ seen.add(k); merged.push(opt) } })
    setGenreOptions(merged)
  }, [genreList, movies])

  const filtered = movies.filter((m: any) => {
    if (status === "all") return true;
    const s = m.status;
    if (status === "now") return s === "now_showing" || s === "now";
    if (status === "coming") return s === "coming_soon" || s === "coming";
    return true;
  });

  const nowPlaying = movies.filter((m: any) => (m.status === "now_showing" || m.status === "now")).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left - list */}
      <div className="md:col-span-2">
        {/* Title */}
        <h1 className="text-xl font-semibold border-l-4 border-blue-600 pl-2 mb-4">PHIM ĐIỆN ẢNH</h1>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
            <option value="Tất cả">Tất cả</option>
            {genreOptions.map((g)=> (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
            <option>Tất cả</option>
            <option>Việt Nam</option>
            <option>Mỹ</option>
            <option>Hàn Quốc</option>
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
            {Array.from({ length: 8 }).map((_, i) => {
              const y = 2025 - i;
              return <option key={y}>{y}</option>;
            })}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
            <option value="now">Đang Chiếu</option>
            <option value="coming">Sắp Chiếu</option>
            <option value="imax">IMAX</option>
            <option value="all">Tất Cả</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
            <option>Xem Nhiều Nhất</option>
            <option>Mới Nhất</option>
          </select>
        </div>

        {/* Movie list like sample */}
        {loading ? (
          <p className="text-gray-500 text-sm text-center py-10">Đang tải phim...</p>
        ) : (
          <div className="space-y-4">
            {(genre==='Tất cả' ? filtered : filtered.filter((m:any)=>{
              const arr = Array.isArray((m as any).genres) ? (m as any).genres : (typeof (m as any).genres === 'string' ? (m as any).genres.split(',').map((x:string)=>x.trim()) : []);
              const norm = (s:string)=> String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
              return arr.some((x:string)=> norm(x) === norm(genre));
            })).map((m: any, idx: number) => (
              <div key={m._id || m.id} className="grid grid-cols-[220px_1fr] gap-4 p-3 border rounded">
                <Link to={`/movies/${m._id || m.id}`} className="block w-[220px] h-[140px] rounded overflow-hidden bg-gray-100">
                  <img src={m.posterUrl || m.poster} alt={m.title || m.name} className="w-full h-full object-cover" />
                </Link>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Link to={`/movies/${m._id || m.id}`} className="text-[#1a6aff] hover:underline font-semibold">
                      {m.title || m.name}
                    </Link>
                    <span className="inline-flex items-center gap-1 text-xs bg-[#1a6aff] text-white px-2 py-0.5 rounded">+ Thích</span>
                    <span className="text-xs text-gray-600">{(idx + 1) * 1234} lượt xem</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{m.description || m.desc || "Đang cập nhật mô tả"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right - Sidebar */}
      <aside className="space-y-6">
        {/* Mua Vé Nhanh theo mẫu */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-orange-500 text-white text-center py-2 font-medium">Mua Vé Nhanh</div>
          <div className="p-3">
            <QuickBooking stacked className="shadow-none border-none" />
          </div>
        </div>

        {/* Phim đang chiếu */}
        <div>
          <h3 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3">PHIM ĐANG CHIẾU</h3>
          <div className="space-y-3">
            {nowPlaying.length > 0 && (
              <SidebarMovieCard movie={{ id: (nowPlaying[0] as any)._id || nowPlaying[0].id, title: nowPlaying[0].title || (nowPlaying[0] as any).name, img: (nowPlaying[0] as any).posterUrl || nowPlaying[0].poster, rating: (nowPlaying[0] as any).averageRating || nowPlaying[0].rating }} size="default" />
            )}
            {nowPlaying.slice(1).map((p: any) => (
              <SidebarMovieCard key={p._id || p.id} movie={{ id: p._id || p.id, title: p.title || p.name, img: (p as any).posterUrl || p.poster, rating: (p as any).averageRating || p.rating }} size="default" />
            ))}
          </div>
          <Link to="/movies" className="block mx-auto mt-4 w-fit border border-orange-500 text-orange-500 px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition">
            Xem thêm →
          </Link>
        </div>
      </aside>
    </div>
  );
}
