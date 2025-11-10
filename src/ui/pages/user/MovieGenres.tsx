import React from "react";
import { Link } from "react-router-dom";
import { useCollection } from "../../../lib/mockCrud";
import { seedAll } from "../../../lib/seed";
import SidebarMovieCard from "../../components/SidebarMovieCard";

export default function MovieGenres() {
  React.useEffect(() => { seedAll(); }, []);
  const { rows: movies = [] } = useCollection<any>("movies");

  const [genre, setGenre] = React.useState<string>("Tất cả");
  const [country, setCountry] = React.useState<string>("Tất cả");
  const [year, setYear] = React.useState<string>("2025");
  const [status, setStatus] = React.useState<string>("now");
  const [sort, setSort] = React.useState<string>("Xem Nhiều Nhất");

  const filtered = movies.filter((m) =>
    status === "all" ? true : m.status === status
  );

  const nowPlaying = movies.filter((m) => m.status === "now").slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left - list */}
      <div className="md:col-span-2">
        {/* Title */}
        <h1 className="text-xl font-semibold border-l-4 border-blue-600 pl-2 mb-4">PHIM ĐIỆN ẢNH</h1>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
            <option>Tất cả</option>
            <option>Hành động</option>
            <option>Tình cảm</option>
            <option>Kinh dị</option>
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
        <div className="space-y-4">
          {filtered.map((m, idx) => (
            <div key={m.id} className="grid grid-cols-[220px_1fr] gap-4 p-3 border rounded">
              <Link to={`/movies/${m.id}`} className="block w-[220px] h-[140px] rounded overflow-hidden bg-gray-100">
                <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
              </Link>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Link to={`/movies/${m.id}`} className="text-[#1a6aff] hover:underline font-semibold">
                    {m.title}
                  </Link>
                  <span className="inline-flex items-center gap-1 text-xs bg-[#1a6aff] text-white px-2 py-0.5 rounded">+ Thích</span>
                  <span className="text-xs text-gray-600">{(idx + 1) * 1234} lượt xem</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{m.desc || "Đang cập nhật mô tả"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Sidebar */}
      <aside className="space-y-6">
        {/* Mua Vé Nhanh */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-blue-800 text-white text-center py-2 font-medium">Mua Vé Nhanh</div>
          <div className="p-3 space-y-3">
            <select className="w-full border rounded-md text-sm px-3 py-1.5"><option>Chọn phim</option></select>
            <select className="w-full border rounded-md text-sm px-3 py-1.5"><option>Chọn rạp</option></select>
            <select className="w-full border rounded-md text-sm px-3 py-1.5"><option>Chọn ngày</option></select>
            <button className="w-full bg-orange-500 text-white rounded-md py-1.5 text-sm hover:bg-orange-600">Mua Vé</button>
          </div>
        </div>

        {/* Phim đang chiếu */}
        <div>
          <h3 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3">PHIM ĐANG CHIẾU</h3>
          <div className="space-y-3">
            {nowPlaying.length > 0 && (
              <SidebarMovieCard movie={nowPlaying[0]} size="large" />
            )}
            {nowPlaying.slice(1).map((p) => (
              <SidebarMovieCard key={p.id} movie={p} size="default" />
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