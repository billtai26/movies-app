import React from "react";
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import SidebarMovieCard from "../../components/SidebarMovieCard";
import QuickBooking from "../../components/QuickBooking";

// Danh sách thể loại mặc định để dự phòng khi chưa có API
const DEFAULT_GENRES = [
  { id: "action", name: "Hành Động", slug: "hanh-dong" },
  { id: "romance", name: "Tình Cảm", slug: "tinh-cam" },
  { id: "horror", name: "Kinh Dị", slug: "kinh-di" },
  { id: "comedy", name: "Hài Hước", slug: "hai-huoc" },
  { id: "scifi", name: "Viễn Tưởng", slug: "vien-tuong" },
  { id: "animation", name: "Hoạt Hình", slug: "hoat-hinh" },
  { id: "adventure", name: "Phiêu Lưu", slug: "phieu-luu" },
  { id: "drama", name: "Tâm Lý", slug: "tam-ly" },
];

export default function MovieGenres() {
  const [movies, setMovies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [genreList, setGenreList] = React.useState<any[]>(DEFAULT_GENRES);
  const [genreOptions, setGenreOptions] = React.useState<{value:string,label:string}[]>([]);

  const [genre, setGenre] = React.useState<string>("Tất cả");
  const [country, setCountry] = React.useState<string>("Tất cả");
  const [year, setYear] = React.useState<string>("2025");
  const [status, setStatus] = React.useState<string>("now");
  const [sort, setSort] = React.useState<string>("Xem Nhiều Nhất");

  // Fetch Movies
  React.useEffect(() => {
    setLoading(true);
    const statusParam = status === 'now' ? 'now_showing' : (status === 'coming' ? 'coming_soon' : undefined);
    const params: any = {};
    if (statusParam) params.status = statusParam;
    
    // Safety check cho genreList
    if (genre && genre !== 'Tất cả' && Array.isArray(genreList)) {
      const found = genreList.find((g:any)=> g && ((g.name===genre) || (g.slug===genre) || (String(g.id)===String(genre))) )
      const val = found ? (found.slug || found.name || found.id) : genre
      params.genre = val
    }

    if (country && country !== 'Tất cả') params.country = country;
    if (year) params.year = year;
    if (sort) params.sort = (sort === 'Xem Nhiều Nhất') ? 'popular' : 'latest';

    api.listMovies(params)
      .then((data: any) => {
        const arr = data?.movies || data || [];
        // Lọc bỏ các phần tử null/undefined ngay khi nhận dữ liệu để tránh crash
        setMovies(Array.isArray(arr) ? arr.filter((m: any) => m) : []);
      })
      .catch((err) => {
        console.error("Lỗi tải phim:", err);
        setMovies([]);
      })
      .finally(() => setLoading(false));
  }, [genre, country, year, status, sort, genreList]);

  // Fetch Genre List (Đã sửa lỗi TypeScript missing property)
  React.useEffect(() => {
    const fetchGenres = async () => {
      try {
        // FIX: Ép kiểu (api as any) để TypeScript không báo lỗi thiếu hàm listGenres
        // Nếu API chưa có hàm này, nó sẽ nhảy xuống catch và dùng DEFAULT_GENRES
        if ((api as any).listGenres) {
            const data = await (api as any).listGenres();
            const arr = data?.genres || data || [];
            if (Array.isArray(arr) && arr.length > 0) {
                setGenreList(arr);
            }
        }
      } catch (e) {
        console.warn("Không tải được danh sách thể loại từ API, dùng danh sách mặc định.");
        // Giữ nguyên DEFAULT_GENRES đã set ban đầu
      }
    };
    fetchGenres();
  }, []);

  // Tính toán Genre Options
  React.useEffect(() => {
    const fromApi = (genreList || []).map((g:any)=> ({ 
      value: g?.slug || g?.name || g?.id, 
      label: g?.name || g?.label || g?.slug || String(g?.id) 
    })).filter(x => x.value && x.label);

    const fromMoviesSet = new Set<string>()
    movies.forEach((m:any)=>{
      if (!m) return;
      const rawGenres = m.genres;
      const arr = Array.isArray(rawGenres) 
        ? rawGenres 
        : (typeof rawGenres === 'string' ? rawGenres.split(',').map((x:string)=>x.trim()) : [])
      
      arr.forEach((x:string)=>{ if (x) fromMoviesSet.add(x) })
    })

    const fromMovies = Array.from(fromMoviesSet).map((x)=> ({ value: x, label: x }))
    const seen = new Set<string>()
    const merged: {value:string,label:string}[] = []
    ;[...fromApi, ...fromMovies].forEach(opt=>{ 
      const k = String(opt.label).toLowerCase(); 
      if (!seen.has(k)){ seen.add(k); merged.push(opt) } 
    })
    setGenreOptions(merged)
  }, [genreList, movies])

  // Lọc phim theo Status
  const filtered = movies.filter((m: any) => {
    if (!m) return false;
    if (status === "all") return true;
    const s = m.status;
    if (status === "now") return s === "now_showing" || s === "now";
    if (status === "coming") return s === "coming_soon" || s === "coming";
    return true;
  });

  // Lọc phim đang chiếu cho Sidebar
  const nowPlaying = movies.filter((m: any) => m && (m.status === "now_showing" || m.status === "now")).slice(0, 3);

  const getMovieLink = (m: any) => `/movies/${m?._id || m?.id || '#'}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-8 min-h-screen">
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

        {/* Movie list */}
        {loading ? (
          <p className="text-gray-500 text-sm text-center py-10">Đang tải phim...</p>
        ) : (
          <div className="space-y-4">
            {(genre==='Tất cả' ? filtered : filtered.filter((m:any)=>{
              if (!m) return false;
              const rawGenres = m.genres;
              const arr = Array.isArray(rawGenres) 
                ? rawGenres 
                : (typeof rawGenres === 'string' ? rawGenres.split(',').map((x:string)=>x.trim()) : []);
              
              const norm = (s:string)=> String(s || '').toLowerCase().replace(/[^a-z0-9]/g,'');
              return arr.some((x:string)=> norm(x) === norm(genre));
            })).map((m: any, idx: number) => {
               if (!m) return null;
               return (
                <div key={m._id || m.id || idx} className="grid grid-cols-[120px_1fr] sm:grid-cols-[220px_1fr] gap-4 p-3 border rounded">
                  <Link to={getMovieLink(m)} className="block w-full h-[160px] sm:h-[140px] rounded overflow-hidden bg-gray-100 shrink-0">
                    <img 
                      src={m.posterUrl || m.poster || "https://via.placeholder.com/220x140?text=No+Image"} 
                      alt={m.title || m.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/220x140?text=Error"; }}
                    />
                  </Link>
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <Link to={getMovieLink(m)} className="text-[#1a6aff] hover:underline font-semibold truncate block">
                        {m.title || m.name || "Chưa có tên"}
                      </Link>
                      <div className="flex gap-2 items-center">
                        <span className="inline-flex items-center gap-1 text-xs bg-[#1a6aff] text-white px-2 py-0.5 rounded whitespace-nowrap">+ Thích</span>
                        <span className="text-xs text-gray-600 whitespace-nowrap">{(idx + 1) * 1234} lượt xem</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                      {m.description || m.desc || "Đang cập nhật mô tả..."}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {!loading && filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400">Không tìm thấy phim phù hợp.</div>
            )}
          </div>
        )}
      </div>

      {/* Right - Sidebar */}
      <aside className="space-y-6">
        {/* Mua Vé Nhanh */}
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
            {nowPlaying.map((p: any) => (
              <SidebarMovieCard 
                key={p._id || p.id} 
                movie={{ 
                  id: p._id || p.id, 
                  title: p.title || p.name, 
                  img: p.posterUrl || p.poster, 
                  rating: p.averageRating || p.rating 
                }} 
                size="default" 
              />
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