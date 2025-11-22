import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { api } from "../../../lib/backendApi";

export default function AdminRevenue() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getAll("revenue"); // gọi đúng /api/revenue
        if (res && Array.isArray(res) && res.length > 0) {
          setData(res);
        } else {
          // fallback mock nếu backend chưa có dữ liệu
          setData(
            Array.from({ length: 12 }).map((_, i) => ({
              month: `T${i + 1}`,
              revenue: Math.round(Math.random() * 50) + 10,
            }))
          );
        }
      } catch (e) {
        console.error("❌ Lỗi tải dữ liệu doanh thu:", e);
        // fallback mock
        setData(
          Array.from({ length: 12 }).map((_, i) => ({
            month: `T${i + 1}`,
            revenue: Math.round(Math.random() * 50) + 10,
          }))
        );
      }
    })();
  }, []);

  const axisColor = document.documentElement.classList.contains("dark")
    ? "#e5e7eb"
    : "#1f2937";

  return (
    <div className="space-y-4">
      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Thống kê doanh thu
      </div>

      <div className="card h-96 bg-white dark:bg-gray-900 shadow rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke={axisColor} />
            <YAxis stroke={axisColor} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
