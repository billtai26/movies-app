import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../lib/api"; // ✅ Import API thật
import toast from "react-hot-toast";
import { Search, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useDebounce } from "../../../lib/useDebounce"; // Dùng debounce để tối ưu tìm kiếm

export default function CheckIn() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Debounce search để tránh gọi API quá nhiều khi gõ
  const debouncedSearch = useDebounce(search, 500);

  // 📥 1. Hàm lấy danh sách vé từ API
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi API list tickets với tham số tìm kiếm
      const params: any = { limit: 50 }; // Lấy 50 vé gần nhất
      if (debouncedSearch) params.q = debouncedSearch;
      if (filter !== 'all') params.status = filter;

      const res = await api.list("tickets", params);
      
      // Xử lý dữ liệu trả về (hỗ trợ nhiều cấu trúc response)
      const list = Array.isArray(res) 
        ? res 
        : (res.data || res.tickets || []);
        
      setTickets(list);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách vé");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter]);

  // Gọi fetchTickets khi filter hoặc search thay đổi
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // 🔄 2. Xử lý Check-in / Check-out
  const toggleStatus = async (t: any) => {
    const isDone = t.status === "done";
    const newStatus = isDone ? "pending" : "done"; // Đảo ngược trạng thái
    const now = new Date().toISOString();
    const id = t._id || t.id;

    // Optimistic update (Cập nhật giao diện trước cho mượt)
    setTickets(prev => prev.map(item => 
      (item._id === id || item.id === id) 
        ? { ...item, status: newStatus, checkinTime: newStatus === "done" ? now : null } 
        : item
    ));

    try {
      // Gọi API update status
      await api.update("tickets", id, {
        status: newStatus,
        checkinTime: newStatus === "done" ? now : null,
      });

      toast.success(
        newStatus === "done" 
          ? `✅ Đã check-in vé ${t.code || ""}` 
          : `↩️ Đã hủy check-in vé ${t.code || ""}`
      );
    } catch (err: any) {
      // Revert lại nếu lỗi
      toast.error(err?.message || "Lỗi cập nhật trạng thái");
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
              className="input pl-10"
            />
          </div>

          {/* Dropdown lọc trạng thái */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input w-full sm:w-40"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chưa vào</option>
            <option value="done">Đã vào</option>
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
          const isDone = t.status === "done";
          const displayTime = t.checkinTime 
            ? new Date(t.checkinTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) 
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
{t.code || t.invoiceCode || "NO-CODE"}
                  </span>
                  {isDone && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1">
                      <CheckCircle size={12}/> Đã vào lúc {displayTime}
                    </span>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {t.movieTitle || t.movie || "Tên phim đang cập nhật"}
                </h3>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                  <span>📍 {t.theaterName || t.cinema || "Rạp chưa rõ"}</span>
                  <span>💺 Ghế: <b className="text-gray-800 dark:text-gray-200">{Array.isArray(t.seats) ? t.seats.join(", ") : t.seats}</b></span>
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
