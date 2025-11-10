import React from "react";
import { Link } from "react-router-dom";
import MovieCard from "../../components/MovieCard";
import { useCollection } from "../../../lib/mockCrud";
import { seedAll } from "../../../lib/seed";

export default function Movies() {
  React.useEffect(() => { seedAll(); }, []);
  const { rows: movies = [] } = useCollection<any>("movies");
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Danh sách phim
        </h1>
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
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          Không tìm thấy phim nào phù hợp.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {filtered.map((m) => (
            <MovieCard key={m.id} movie={m} />
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
    Only Cinema mang đến cho bạn những tác phẩm điện ảnh đa dạng: từ hành động mãn nhãn, 
    tình cảm ngọt ngào đến kinh dị nghẹt thở. Cùng khám phá ngay danh sách phim đang chiếu hấp dẫn nhất tuần này!
  </p>
  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-3">
    Nổi bật trong số đó là các siêu phẩm như <b>Trò Chơi Ảo Giác: Ares</b> – tiếp nối huyền thoại Tron, 
    <b>Nhà Ma Xó</b> – phim kinh dị Việt Nam đang gây sốt phòng vé, cùng hàng loạt phim 
    hoạt hình và tâm lý xã hội đang thu hút đông đảo khán giả.
  </p>
  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-3">
    Hãy đến Only Cinema để tận hưởng trải nghiệm điện ảnh đỉnh cao, cùng âm thanh Dolby và hình ảnh chuẩn 4K. 
    Đặt vé ngay hôm nay để không bỏ lỡ suất chiếu yêu thích của bạn!
  </p>
</div>

    </div>
  );
}
