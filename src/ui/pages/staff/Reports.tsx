import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api"; 
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
  
  // --- Thống kê (Cập nhật theo data Backend trả về) ---
  const [stats, setStats] = useState({ 
    totalTickets: 0, 
    totalRevenue: 0, 
    totalBookings: 0 
  });

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
      
      // Gọi song song 2 API: 1 cho thống kê, 1 cho danh sách báo cáo
      const [statsResult, reportsResult] = await Promise.allSettled([
        api.getStaffReportStats(), // Gọi endpoint thống kê riêng
        api.list("staff-reports")       // Gọi endpoint danh sách báo cáo
      ]);

      // --- Xử lý kết quả Thống kê ---
      if (statsResult.status === "fulfilled") {
        const res = statsResult.value;
        // Backend trả về: { totalRevenue, totalTickets, totalBookings }
        setStats({
          totalTickets: res.totalTickets || 0,
          totalRevenue: res.totalRevenue || 0,
          totalBookings: res.totalBookings || 0
        });
      } else {
        console.error("❌ Lỗi API Stats:", statsResult.reason);
      }

      // --- Xử lý kết quả Danh sách Báo cáo ---
      if (reportsResult.status === "fulfilled") {
        const res = reportsResult.value;
        const reportList = Array.isArray(res) ? res : (res.data || []);
        
        // Sắp xếp mới nhất lên đầu
        setReports(reportList.sort((a: any, b: any) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ));
      } else {
        console.error("❌ Lỗi API Reports:", reportsResult.reason);
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

      // Gọi API tạo báo cáo
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
      {/* --- Phần thống kê (Hiển thị theo dữ liệu API Stats) --- */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4 bg-white shadow rounded-xl text-center border border-blue-100">
          <div className="text-sm opacity-70 text-gray-600">Tổng vé bán ra</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalTickets.toLocaleString()}
          </div>
        </div>
        
        <div className="card p-4 bg-white shadow rounded-xl text-center border border-green-100">
          <div className="text-sm opacity-70 text-gray-600">Doanh thu (VND)</div>
          <div className="text-3xl font-bold text-green-600">
            {stats.totalRevenue.toLocaleString()}
          </div>
        </div>
        
        <div className="card p-4 bg-white shadow rounded-xl text-center border border-yellow-100">
          <div className="text-sm opacity-70 text-gray-600">Tổng đơn hàng</div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.totalBookings.toLocaleString()}
          </div>
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
              className="input w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 border"
              placeholder="Nhập tên của bạn"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 border"
              placeholder="Ví dụ: Máy in vé bị lỗi"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Nội dung chi tiết</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input w-full h-28 resize-none border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 border"
              placeholder="Mô tả chi tiết sự cố..."
            />
          </div>

          <button type="submit" className="bg-[#f26b38] hover:bg-[#d95d2f] text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
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
                  <td colSpan={4} className="text-center py-8 text-gray-500 italic">
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