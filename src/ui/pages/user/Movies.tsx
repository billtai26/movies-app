import React, { useState, useEffect } from "react";
import MovieCard from "../../components/MovieCard";
import { api } from "../../../lib/api"; // Sửa lại đường dẫn import
import { useSearchParams } from "react-router-dom";

// Tốt hơn nên định nghĩa số lượng phim mỗi trang ở đây
const MOVIES_PER_PAGE = 12; // 12 phim mỗi trang (3 hàng x 4 cột)

export default function Movies() {
  // --- 1. Thêm useSearchParams ---
  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("search") || ""; // Lấy ?search=... từ URL

  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State mới để theo dõi phân trang
  const [currentPage, setCurrentPage] = useState(1); // Luôn bắt đầu từ trang 1
  const [totalPages, setTotalPages] = useState(0); // API sẽ cho chúng ta biết tổng số trang

  // --- 2. Cập nhật useEffect ---
  useEffect(() => {
    const fetchAllMovies = async () => {
      setLoading(true);
      
      // Tạo đối tượng params
      const params: { page: number, limit: number, q?: string } = {
        page: currentPage,
        limit: MOVIES_PER_PAGE
      };
      
      // Nếu có query từ URL, thêm vào params
      if (queryFromUrl) {
        params.q = queryFromUrl;
      }

      try {
        // Gửi params (bao gồm page, limit, và q nếu có)
        const data = await api.listMovies(params); // <-- Gửi params đã cập nhật
        
        if (data.movies && Array.isArray(data.movies)) {
          setMovies(data.movies);
          setTotalPages(data.pagination.totalPages);
        } else {
          setMovies([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error("Lỗi khi fetch phim:", err);
        setMovies([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMovies();
  }, [currentPage, queryFromUrl]); // <-- THÊM queryFromUrl VÀO DEPENDENCY

  // --- 3. Cập nhật hàm xử lý (reset trang khi tìm kiếm) ---
  // Khi queryFromUrl thay đổi (ví dụ: người dùng tìm kiếm từ NavBar),
  // chúng ta nên reset về trang 1.
  useEffect(() => {
    setCurrentPage(1);
  }, [queryFromUrl]);

  const handlePrevPage = () => {
    // Chỉ giảm nếu không phải trang đầu tiên
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    // Chỉ tăng nếu không phải trang cuối cùng
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // --- 4. Cập nhật JSX (thay đổi tiêu đề) ---
  return (
    <div className="min-h-screen bg-[#f6f7f9] py-12">
      <div className="max-w-7xl mx-auto px-3">
        {/* Tiêu đề động dựa trên việc có tìm kiếm hay không */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          {queryFromUrl 
            ? `Kết quả tìm kiếm cho "${queryFromUrl}"` 
            : "Tất cả phim"}
        </h2>

        {loading ? (
          <p className="text-gray-500 text-sm text-center py-10">
            Đang tải phim...
          </p>
        ) : movies.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-10">
            {queryFromUrl
              ? "Không tìm thấy phim nào phù hợp."
              : "Không tìm thấy bộ phim nào."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>

            {/* --- Giao diện Phân Trang --- */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1} // Vô hiệu hóa nút khi ở trang 1
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang trước
                </button>
                
                <span className="text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages} // Vô hiệu hóa nút khi ở trang cuối
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
