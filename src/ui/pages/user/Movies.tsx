import React, { useState, useEffect } from "react";
import MovieCard from "../../components/MovieCard";
import { api } from "../../../lib/api"; // Sửa lại đường dẫn import

// Tốt hơn nên định nghĩa số lượng phim mỗi trang ở đây
const MOVIES_PER_PAGE = 12; // 12 phim mỗi trang (3 hàng x 4 cột)

export default function Movies() {
  // --- 1. Cập nhật State ---
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State mới để theo dõi phân trang
  const [currentPage, setCurrentPage] = useState(1); // Luôn bắt đầu từ trang 1
  const [totalPages, setTotalPages] = useState(0); // API sẽ cho chúng ta biết tổng số trang

  // --- 2. Cập nhật useEffect ---
  useEffect(() => {
    const fetchAllMovies = async () => {
      setLoading(true);
      try {
        // Gửi cả page và limit tới API
        const data = await api.listMovies({ 
          page: currentPage, 
          limit: MOVIES_PER_PAGE 
        });
        
        // Ghi nhận dữ liệu trả về
        if (data.movies && Array.isArray(data.movies)) {
          setMovies(data.movies);
          // Lưu lại tổng số trang từ API
          setTotalPages(data.pagination.totalPages);
        } else {
          setMovies([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error("Lỗi khi fetch tất cả phim:", err);
        setMovies([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMovies();
  }, [currentPage]); // Quan trọng: useEffect sẽ chạy lại khi `currentPage` thay đổi

  // --- 3. Thêm hàm xử lý sự kiện cho nút ---
  const handlePrevPage = () => {
    // Chỉ giảm nếu không phải trang đầu tiên
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    // Chỉ tăng nếu không phải trang cuối cùng
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // --- 4. Cập nhật JSX (thêm phần phân trang) ---
  return (
    <div className="min-h-screen bg-[#f6f7f9] py-12">
      <div className="max-w-7xl mx-auto px-3">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Tất cả phim
        </h2>

        {loading ? (
          <p className="text-gray-500 text-sm text-center py-10">
            Đang tải phim...
          </p>
        ) : movies.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-10">
            Không tìm thấy bộ phim nào.
          </p>
        ) : (
          // Dùng React.Fragment <>...</> để bao bọc grid và nút
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {/* Dùng movie._id cho key */}
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
