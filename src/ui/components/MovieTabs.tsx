import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";
import { api } from "../../lib/api";

export default function MovieTabs() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"now" | "coming" | "imax" | "all">("now");

  const tabs = [
    { key: "now", label: "Đang chiếu" },
    { key: "coming", label: "Sắp chiếu" },
    { key: "imax", label: "Phim IMAX" }, // giữ để UI có 4 tab
    { key: "all", label: "Toàn quốc" },
  ];

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let statusParam = undefined;
        if (tab === 'now') {
          statusParam = 'now_showing'; // Gửi 'now_showing' thay vì 'now'
        } else if (tab === 'coming') {
          statusParam = 'coming_soon'; // Gửi 'coming_soon' thay vì 'coming'
        }
        // Nếu tab là 'imax' hoặc 'all', statusParam vẫn là undefined (để backend tự xử lý)
        
        // Gọi API thật từ backendApi.ts
        const data = await api.listMovies({ status: statusParam }); 

        console.log('DỮ LIỆU API TRẢ VỀ:', JSON.stringify(data, null, 2));

        setMovies(data.movies && Array.isArray(data.movies) ? data.movies : []); // Lưu kết quả vào state
      } catch (err) {
        console.error("Lỗi khi fetch phim:", err);
        setMovies([]); // Đặt mảng rỗng nếu có lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [tab]); // Phụ thuộc vào 'tab', khi tab thay đổi, gọi lại API

  // Lọc phim theo tab (logic này giữ nguyên, nó sẽ lọc client-side)
  // API đã lọc cho 'now' và 'coming' rồi.
  // Chúng ta chỉ cần lọc client-side cho 'imax' (nếu cần).
  const filtered =
    tab === 'imax'
      ? movies.filter((m) => m.isImax) // Giả sử bạn có trường 'isImax'
      : movies; // Đối với 'now', 'coming', 'all', chỉ cần dùng mảng 'movies' từ API
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
              className={`text-sm font-medium transition ${
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

      {/* 4. Thêm kiểm tra loading */}
      {loading ? (
        <p className="text-gray-500 text-sm text-center py-10">
          Đang tải phim...
        </p>
      ) : visible.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-10">
          Hiện chưa có phim nào trong mục này.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {visible.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          {/* Nút Xem thêm */}
          {tab === "now" && filtered.length > 8 && (
            <div className="flex justify-center mt-8">
              <Link
                to="/movies"
                className="border border-[#f58a1f] text-[#f58a1f] hover:bg-[#f58a1f] hover:text-white transition px-6 py-2 rounded-md text-sm font-medium"
              >
                Xem thêm
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
