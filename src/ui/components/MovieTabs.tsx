import React, { useState } from "react";
import { useCollection } from "../../lib/mockCrud";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visible.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
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
