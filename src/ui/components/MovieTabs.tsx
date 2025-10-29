import React, { useState } from "react";
import { useCollection } from "../../lib/mockCrud";
import { Link } from "react-router-dom";

export default function MovieTabs() {
  const { rows: movies = [] } = useCollection<any>("movies" as any);
  const [tab, setTab] = useState<"now" | "coming" | "imax" | "all">("now");

  const tabs = [
    { key: "now", label: "Đang chiếu" },
    { key: "coming", label: "Sắp chiếu" },
    { key: "imax", label: "Phim IMAX" },
    { key: "all", label: "Toàn quốc" },
  ];

  // Lọc phim theo tab
  const filtered =
    tab === "all" ? movies : movies.filter((m) => m.status === tab);
  // Giới hạn 8 phim ở tab "Đang chiếu"
  const visible = tab === "now" ? filtered.slice(0, 8) : filtered;

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center gap-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          PHIM
        </h2>

        <div className="flex gap-5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`text-sm font-medium ${
                tab === t.key
                  ? "text-[#1a6aff] border-b-2 border-[#1a6aff] pb-1"
                  : "text-gray-500 hover:text-[#1a6aff]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Movie grid */}
      {visible.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-10">
          Hiện chưa có phim nào trong mục này.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {visible.map((movie) => (
              <div
                key={movie.id}
                className="group bg-white rounded-xl shadow-sm overflow-hidden transition hover:shadow-md"
              >
                <div className="relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-[380px] object-cover"
                  />
                  {/* Overlay hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300">
                    <Link
                      to={`/booking/select?movie=${movie.id}`}
                      className="bg-[#f58a1f] hover:bg-[#f07a00] text-white font-semibold px-4 py-2 rounded-md mb-2 transition"
                    >
                      🎟 Mua vé
                    </Link>
                    <button className="bg-white/90 hover:bg-white text-gray-900 font-semibold px-4 py-2 rounded-md transition">
                      ▶ Trailer
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="px-1.5 py-0.5 rounded bg-gray-800 text-white text-[11px]">
                      {movie.rating}
                    </span>
                    <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[11px] font-medium">
                      {Math.floor(Math.random() * 2) + 7 + "." + Math.floor(Math.random() * 9)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Nút Xem thêm ở giữa */}
          {tab === "now" && filtered.length > 8 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => (window.location.href = "/movies")}
                className="border border-[#f58a1f] text-[#f58a1f] hover:bg-[#f58a1f] hover:text-white transition px-6 py-2 rounded-md text-sm font-medium"
              >
                Xem thêm
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
