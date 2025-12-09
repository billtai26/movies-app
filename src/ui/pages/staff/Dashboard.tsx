import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api"; // ✅ Import API thật
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";
import LoadingOverlay from "../../components/LoadingOverlay"; // Thêm loading nếu có

const COLORS = ["#22c55e", "#ef4444"];

// Hàm tiện ích lấy nhãn thứ (T2...CN)
const getDayLabel = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  if (day === 0) return "CN";
  return `T${day + 1}`;
};

export default function StaffDashboard() {
  const [weekData, setWeekData] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState({
    checked: 0,
    combos: 0,
    incidents: 0,
  });
  const [loading, setLoading] = useState(false);

  // --- HÀM TẢI & XỬ LÝ DỮ LIỆU ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Gọi song song 3 API để lấy dữ liệu tổng hợp
      // (Trong thực tế nên có API dashboard riêng, nhưng ở đây ta tính client-side tạm)
      const [ticketsRes, ordersRes, reportsRes] = await Promise.all([
        api.list("tickets", { limit: 1000 }), // Lấy danh sách vé (giới hạn nhiều chút)
        api.list("orders", { limit: 1000 }),  // Lấy đơn combo
        api.list("staff-reports"),            // Lấy báo cáo
      ]);

      // Chuẩn hóa dữ liệu mảng
      const tickets = Array.isArray(ticketsRes) ? ticketsRes : (ticketsRes.tickets || ticketsRes.data || []);
      const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes.data || []);
      const reports = Array.isArray(reportsRes) ? reportsRes : (reportsRes.data || []);

      const now = new Date();
      
      // 2. TÍNH TOÁN SỐ LIỆU HÔM NAY (Today Stats)
      const isToday = (dStr: string) => {
        if (!dStr) return false;
        const d = new Date(dStr);
        return d.getDate() === now.getDate() && 
               d.getMonth() === now.getMonth() && 
               d.getFullYear() === now.getFullYear();
      };

      const checkedToday = tickets.filter((t: any) => t.status === 'done' && isToday(t.checkinTime || t.updatedAt)).length;
      const combosToday = orders.filter((o: any) => isToday(o.createdAt)).length;
      const incidentsToday = reports.filter((r: any) => isToday(r.createdAt)).length;

      setTodayStats({
        checked: checkedToday,
        combos: combosToday,
        incidents: incidentsToday
      });

      // 3. TÍNH TOÁN BIỂU ĐỒ (7 ngày gần nhất)
      const daysMap = new Map();
      // Khởi tạo map cho 7 ngày qua
      for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const label = getDayLabel(d.toISOString());
        // Key là label (T2, T3...), Value là obj data
        if (!daysMap.has(label)) {
daysMap.set(label, { day: label, checkin: 0, revenue: 0 });
        }
      }

      // Cộng dồn Vé (Doanh thu + Check-in)
      tickets.forEach((t: any) => {
        if (!t.createdAt) return;
        const label = getDayLabel(t.createdAt);
        if (daysMap.has(label)) {
          const entry = daysMap.get(label);
          if (t.status === 'done') entry.checkin += 1;
          // Cộng doanh thu vé (lấy trường price hoặc total)
          entry.revenue += (Number(t.price || t.total) || 0);
        }
      });

      // Cộng dồn Combo (Doanh thu)
      orders.forEach((o: any) => {
        if (!o.createdAt) return;
        const label = getDayLabel(o.createdAt);
        if (daysMap.has(label)) {
          const entry = daysMap.get(label);
          entry.revenue += (Number(o.total || o.price) || 0);
        }
      });

      setWeekData(Array.from(daysMap.values()));
      toast.success("Dữ liệu đã được cập nhật");

    } catch (error) {
      console.error("Lỗi Dashboard:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- TÍNH TOÁN CHART ---
  const totalCheckinWeek = weekData.reduce((s, x) => s + x.checkin, 0);
  const totalCapacity = 1000; // Giả định sức chứa tuần
  const notCheckin = Math.max(0, totalCapacity - totalCheckinWeek);

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const axisColor = isDark ? "#e5e7eb" : "#1f2937";
  const barColor = isDark ? "#3b82f6" : "#2563eb";
  const gridColor = isDark ? "#374151" : "#e5e7eb";

  return (
    <div className="space-y-5 relative min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Tổng quan
        </h1>
        <button className="btn-primary" onClick={fetchData} disabled={loading}>
          {loading ? "Đang tải..." : "Làm mới dữ liệu"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4 border rounded-xl shadow-sm bg-white dark:bg-gray-800">
          <div className="text-sm opacity-70 text-gray-800 dark:text-gray-300">
            Vé đã check-in hôm nay
          </div>
          <div className="text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400">
            {todayStats.checked}
          </div>
        </div>
        <div className="card p-4 border rounded-xl shadow-sm bg-white dark:bg-gray-800">
          <div className="text-sm opacity-70 text-gray-800 dark:text-gray-300">
            Combo đã giao
          </div>
          <div className="text-3xl font-bold mt-1 text-orange-600 dark:text-orange-400">
            {todayStats.combos}
          </div>
        </div>
        <div className="card p-4 border rounded-xl shadow-sm bg-white dark:bg-gray-800">
<div className="text-sm opacity-70 text-gray-800 dark:text-gray-300">
            Sự cố mới
          </div>
          <div className="text-3xl font-bold mt-1 text-red-600 dark:text-red-400">
            {todayStats.incidents}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card h-80 p-4">
          <div className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            Tỷ lệ check-in (Tuần này)
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Đã Check-in", value: totalCheckinWeek },
                  { name: "Trống", value: notCheckin },
                ]}
                dataKey="value"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={4}
              >
                <Cell key="cell-0" fill="#22c55e" />
                <Cell key="cell-1" fill={isDark ? "#374151" : "#e5e7eb"} />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#fff",
                  borderColor: isDark ? "#374151" : "#e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-80 p-4">
          <div className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            Lượng Check-in theo ngày
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="day" stroke={axisColor} tickLine={false} axisLine={false} />
              <YAxis stroke={axisColor} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#fff",
                  borderColor: isDark ? "#374151" : "#e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="checkin" fill={barColor} radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card h-80 p-4">
        <div className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
          Doanh thu theo ngày (Vé + Combo)
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="day" stroke={axisColor} tickLine={false} axisLine={false} />
            <YAxis stroke={axisColor} tickLine={false} axisLine={false}
tickFormatter={(val) => `${val/1000}k`} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              formatter={(v: number) => v.toLocaleString("vi-VN") + " ₫"}
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#fff",
                borderColor: isDark ? "#374151" : "#e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="revenue" fill={isDark ? "#f97316" : "#fb923c"} radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {loading && <LoadingOverlay isLoading={true} message="Đang cập nhật số liệu..." />}
    </div>
  );
}
