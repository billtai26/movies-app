import React from "react";
import { Link } from "react-router-dom";
import { useCollection } from "../../../lib/mockCrud";

export default function Movies() {
  const { rows: movies = [] } = useCollection<any>("movies");
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"now" | "coming" | "imax" | "all">("now");

  // Tabs y chang Galaxy
  const tabs = [
    { key: "now", label: "Đang chiếu" },
    { key: "coming", label: "Sắp chiếu" },
    { key: "imax", label: "Phim IMAX" },
    { key: "all", label: "Toàn quốc" },
  ];

  // Lọc phim theo tab
  const filtered =
    tab === "all" ? movies : movies.filter((m) => m.status === tab);

  // Lọc theo từ khóa tìm kiếm
  const searched = filtered.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Danh sách phim
        </h1>
        <input
          className="input border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
          placeholder="Tìm kiếm phim..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-6 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`text-sm font-medium transition-colors ${
              tab === t.key
                ? "text-[#1a6aff] border-b-2 border-[#1a6aff] pb-1"
                : "text-gray-500 hover:text-[#1a6aff]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Movie grid */}
      {searched.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          Không tìm thấy phim nào phù hợp.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {searched.map((m) => (
            <div
              key={m.id}
              className="group relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-lg transition"
            >
              {/* Poster */}
              <img
                src={m.poster}
                alt={m.title}
                className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                <button className="rounded-lg bg-white/90 hover:bg-white text-gray-900 text-sm font-medium px-3 py-1">
                  ▶ Trailer
                </button>
                <Link
                  to={`/booking/select?movie=${m.id}`}
                  className="rounded-lg bg-[#f58a1f] hover:bg-[#f07a00] text-white text-sm font-medium px-3 py-1"
                >
                  🎟 Mua vé
                </Link>
              </div>

              {/* Info dưới */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-white">
                <div className="font-semibold text-sm line-clamp-1">
                  {m.title}
                </div>
                {m.genre && (
                  <div className="text-xs opacity-80 line-clamp-1">
                    {Array.isArray(m.genre) ? m.genre.join(", ") : m.genre}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* --- Mô tả phim đang chiếu (SEO section) --- */}
<div className="mt-12 border-t pt-8">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
    PHIM ĐANG CHIẾU
  </h2>
  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
    Một mùa Halloween lại đến, và không khí rùng rợn tràn ngập các rạp chiếu phim. 
    Cinesta mang đến cho bạn những tác phẩm điện ảnh đa dạng: từ hành động mãn nhãn, 
    tình cảm ngọt ngào đến kinh dị nghẹt thở. Cùng khám phá ngay danh sách phim đang chiếu hấp dẫn nhất tuần này!
  </p>
  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-3">
    Nổi bật trong số đó là các siêu phẩm như <b>Trò Chơi Ảo Giác: Ares</b> – tiếp nối huyền thoại Tron, 
    <b>Nhà Ma Xó</b> – phim kinh dị Việt Nam đang gây sốt phòng vé, cùng hàng loạt phim 
    hoạt hình và tâm lý xã hội đang thu hút đông đảo khán giả.
  </p>
  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-3">
    Hãy đến Cinesta để tận hưởng trải nghiệm điện ảnh đỉnh cao, cùng âm thanh Dolby và hình ảnh chuẩn 4K. 
    Đặt vé ngay hôm nay để không bỏ lỡ suất chiếu yêu thích của bạn!
  </p>
</div>

    </div>
  );
}
