import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Search, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useDebounce } from "../../../lib/useDebounce";

export default function CheckIn() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' | 'used' | 'unused'

  const debouncedSearch = useDebounce(search, 500);

  // 📥 1. Hàm lấy danh sách vé từ API
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (debouncedSearch) params.q = debouncedSearch;
      
      // Map bộ lọc Frontend sang Backend
      // Lưu ý: Backend lọc theo 'isUsed' (boolean), không phải status string
      if (filter === 'done') params.isUsed = true; 
      if (filter === 'pending') params.isUsed = false;

      const res = await api.list("tickets", params);
      
      // Xử lý dữ liệu trả về linh hoạt
      const list = Array.isArray(res) 
        ? res 
        : (res.data || res.bookings || res.tickets || []);
        
      setTickets(list);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách vé");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // 🔄 2. Xử lý Check-in / Check-out (SỬA LOGIC TẠI ĐÂY)
  const toggleStatus = async (t: any) => {
    // Dùng trường 'isUsed' thay vì 'status'
    const currentIsUsed = t.isUsed; 
    const newIsUsed = !currentIsUsed; // Đảo ngược trạng thái
    const id = t._id || t.id;

    // Optimistic update (Cập nhật giao diện ngay lập tức)
    setTickets(prev => prev.map(item => 
      (item._id === id || item.id === id) 
        ? { 
            ...item, 
            isUsed: newIsUsed, 
            updatedAt: newIsUsed ? new Date().toISOString() : item.updatedAt 
          } 
        : item
    ));

    try {
      // --- SỬA QUAN TRỌNG ---
      // Chỉ gửi 'isUsed', KHÔNG gửi 'status' hay 'checkinTime'
      await api.update("tickets", id, {
        isUsed: newIsUsed
      });

      toast.success(
        newIsUsed 
          ? `✅ Đã check-in vé ${t.code || ""}` 
          : `↩️ Đã hoàn tác vé ${t.code || ""}`
      );
    } catch (err: any) {
      // Revert nếu lỗi
      toast.error(err?.response?.data?.message || err?.message || "Lỗi cập nhật trạng thái");
      fetchTickets(); // Tải lại dữ liệu gốc
    }
  };

  return (
    <div className="card space-y-6 p-6 min-h-[80vh]">
      {/* --- Header & Bộ lọc --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <CheckCircle className="text-blue-600" /> Soát Vé / Check-in
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm mã vé, phim, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full !pl-10"
            />
          </div>

          {/* Dropdown lọc trạng thái */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input w-full sm:w-40"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chưa vào (Chưa dùng)</option>
            <option value="done">Đã vào (Đã dùng)</option>
          </select>

          {/* Nút Refresh */}
          <button 
            onClick={() => fetchTickets()}
            className="btn-outline px-3"
            title="Làm mới"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* --- Danh sách vé --- */}
      <div className="space-y-3">
        {loading && tickets.length === 0 && (
          <div className="text-center py-10 text-gray-500 flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-500" size={32}/>
            <span>Đang tải dữ liệu...</span>
          </div>
        )}

        {!loading && tickets.length === 0 && (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">Không tìm thấy vé nào phù hợp.</p>
          </div>
        )}

        {tickets.map((t) => {
          // SỬA: Dùng biến isUsed để xác định trạng thái hiển thị
          const isDone = t.isUsed; 
          
          // Backend không lưu checkinTime riêng, ta dùng updatedAt nếu vé đã dùng
          const displayTime = (isDone && t.updatedAt)
            ? new Date(t.updatedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) 
            : null;

          return (
            <div
              key={t._id || t.id}
              className={`
                group flex flex-col sm:flex-row sm:items-center justify-between 
                p-4 rounded-xl border transition-all duration-200
                ${isDone 
                  ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800" 
                  : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md"
                }
              `}
            >
              {/* Thông tin vé */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">
                    {t.code || t.transactionId || t._id?.substring(0,8).toUpperCase() || "NO-CODE"}
                  </span>
                  {isDone && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1">
                      <CheckCircle size={12}/> Đã vào lúc {displayTime}
                    </span>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {t.movieTitle || t.movie?.title || "Phim không xác định"}
                </h3>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                  <span>📍 {t.theaterName || t.cinema?.name || "Rạp không xác định"}</span>
                  <span>💺 Ghế: 
                    <b className="text-gray-800 dark:text-gray-200 ml-1">
                      {/* Xử lý hiển thị ghế nếu là object hoặc string */}
                      {Array.isArray(t.seats) 
                        ? t.seats.map((s: any) => typeof s === 'object' ? `${s.row}${s.number}` : s).join(", ") 
                        : t.seats}
                    </b>
                  </span>
                  {t.startTime && (
                    <span>🕒 {new Date(t.startTime).toLocaleString('vi-VN')}</span>
                  )}
                </div>
              </div>

              {/* Nút hành động */}
              <div className="mt-4 sm:mt-0 flex items-center gap-3">
                <button
                  onClick={() => toggleStatus(t)}
                  className={`
                    w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm
                    ${isDone
                      ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5"
                    }
                  `}
                >
                  {isDone ? (
                    <>
                      <XCircle size={16} /> Hủy Check-in
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} /> CHECK-IN
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}