import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api"; // ✅ Dùng API thật
import { toast } from "react-toastify";
import LoadingOverlay from "../../components/LoadingOverlay";

interface Report {
  _id: string;
  staff: string;
  title: string;
  message: string;
  status: "Chưa duyệt" | "Đã duyệt" | "Từ chối";
  createdAt: string;
}

export default function Reports() {
  const [loading, setLoading] = useState(false);
  
  // --- Thống kê vé ---
  const [ticketStats, setTicketStats] = useState({ total: 0, done: 0, pending: 0 });

  // --- Báo cáo ---
  const [reports, setReports] = useState<Report[]>([]);
  
  // Form state
  const [staffName, setStaffName] = useState(""); 
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 1. Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // ✅ Dùng Promise.allSettled để API nào lỗi thì chỉ API đó fail, không kéo theo cái khác
      const [ticketsResult, reportsResult] = await Promise.allSettled([
        api.list("tickets", { limit: 1000 }), // Lấy số lượng lớn để tính toán
        api.list("staff-reports")
      ]);

      // --- Xử lý kết quả Vé ---
      if (ticketsResult.status === "fulfilled") {
        const res = ticketsResult.value;
        // Xử lý linh hoạt response trả về (mảng hoặc object chứa data)
        const tickets = Array.isArray(res) ? res : (res.tickets || res.data || []);
        
        const total = tickets.length;
        const done = tickets.filter((t: any) => t.status === "done" || t.status === "paid").length;
        setTicketStats({ total, done, pending: total - done });
      } else {
        console.error("❌ Lỗi API Tickets:", ticketsResult.reason);
        // Không toast lỗi vé để tránh làm phiền nếu chỉ là lỗi mạng nhỏ
      }

      // --- Xử lý kết quả Báo cáo ---
      if (reportsResult.status === "fulfilled") {
        const res = reportsResult.value;
        const reportList = Array.isArray(res) ? res : (res.data || []);
        
        // Sắp xếp mới nhất lên đầu
        setReports(reportList.sort((a: any, b: any) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ));
      } else {
        console.error("❌ Lỗi API Reports:", reportsResult.reason);
        // Có thể API /staff-reports chưa được backend implement
        toast.warning("Chưa thể tải danh sách báo cáo cũ.");
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // 2. Xử lý gửi báo cáo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !title || !content) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        staff: staffName,
        title: title, 
        message: content,
        status: "Chưa duyệt",
      };

      const newReport = await api.create("staff-reports", payload);
      
      // Cập nhật UI ngay lập tức
      setReports((prev) => [newReport, ...prev]);
      
      // Reset form
      setTitle("");
      setContent("");
      toast.success("✅ Đã gửi báo cáo lên hệ thống!");
    } catch (error: any) {
      console.error("Lỗi gửi báo cáo:", error);
      const msg = error?.response?.data?.message || "Gửi thất bại, vui lòng thử lại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 relative">
      {/* --- Phần thống kê vé --- */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4 bg-white shadow rounded-xl text-center">
          <div className="text-sm opacity-70 text-gray-600">Tổng vé hôm nay</div>
          <div className="text-3xl font-bold text-blue-600">{ticketStats.total}</div>
        </div>
        <div className="card p-4 bg-white shadow rounded-xl text-center">
          <div className="text-sm opacity-70 text-gray-600">Đã vào rạp</div>
          <div className="text-3xl font-bold text-green-500">{ticketStats.done}</div>
        </div>
        <div className="card p-4 bg-white shadow rounded-xl text-center">
          <div className="text-sm opacity-70 text-gray-600">Chưa vào</div>
          <div className="text-3xl font-bold text-yellow-500">{ticketStats.pending}</div>
        </div>
      </div>

      {/* --- Form gửi báo cáo --- */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md w-full border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
          Báo cáo sự cố / Yêu cầu hỗ trợ
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Tên nhân viên</label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="input w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tên của bạn"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ví dụ: Máy in vé bị lỗi"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Nội dung chi tiết</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input w-full h-28 resize-none border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả chi tiết sự cố..."
            />
          </div>

          <button type="submit" className="btn-primary bg-[#f26b38] hover:bg-[#d95d2f] text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Gửi báo cáo
          </button>
        </form>
      </div>

      {/* --- Danh sách báo cáo --- */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-3 text-gray-800">Lịch sử báo cáo</h3>
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
              <tr>
                <th className="px-4 py-3 text-left w-1/5">Nhân viên</th>
                <th className="px-4 py-3 text-left w-2/5">Nội dung</th>
                <th className="px-4 py-3 text-left w-1/5">Trạng thái</th>
                <th className="px-4 py-3 text-left w-1/5">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((r) => (
                <tr key={r._id || (r as any).id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.staff}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">{r.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{r.message}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                      ${r.status === 'Đã duyệt' ? 'bg-green-100 text-green-700' : 
                        r.status === 'Từ chối' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '—'}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    Chưa có báo cáo nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LoadingOverlay isLoading={loading} message="Đang xử lý..." />
    </div>
  );
}