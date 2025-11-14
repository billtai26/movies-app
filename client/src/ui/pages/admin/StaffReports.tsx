import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { format } from "date-fns";

export default function AdminStaffReports() {
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getAll(`staff-reports?month=${month}`);
      setRows(res || []);
    } catch (e) {
      console.error("❌ Lỗi tải báo cáo nhân viên:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Báo cáo nhân viên
        </h2>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Chọn tháng:
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Không có dữ liệu báo cáo cho tháng này.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl dark:border-gray-800">
          <table className="min-w-[700px] w-full text-sm border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-3 py-2">#</th>
                <th className="text-left px-3 py-2">Nhân viên</th>
                <th className="text-center px-3 py-2">Email</th>
                <th className="text-center px-3 py-2">Số vé xử lý</th>
                <th className="text-center px-3 py-2">Doanh thu (₫)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={i}
                  className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                >
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2 font-medium">
                    {r.staff?.name || "—"}
                  </td>
                  <td className="text-center px-3 py-2 text-gray-500">
                    {r.staff?.email || "—"}
                  </td>
                  <td className="text-center px-3 py-2">
                    {r.totalTicketsHandled}
                  </td>
                  <td className="text-center px-3 py-2 font-semibold text-green-600">
                    {r.totalRevenueHandled?.toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
