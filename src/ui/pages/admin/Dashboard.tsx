import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from "recharts";
import {
  MapContainer, TileLayer, Marker, Popup, useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave, faTicketAlt, faUserPlus, faComments } from "@fortawesome/free-solid-svg-icons";
import { api } from "../../../lib/backendApi";

// ================= Fix icon leaflet khi build =================
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ================= MapUpdater =================
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function AdminDashboard() {
  const [selectedCity, setSelectedCity] = useState<string>("Tất cả");
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ticketData, setTicketData] = useState<any[]>([]);
  const [topMovies, setTopMovies] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);

  const axisColor = document.documentElement.classList.contains("dark")
    ? "#e5e7eb"
    : "#1f2937";

  // 🧭 Fetch real data from backend
  useEffect(() => {
    (async () => {
      try {
        const [rev, tick, tops, theaters] = await Promise.all([
          api.list("revenue"),   // Thay api.getAll("revenue")
          api.list("tickets"),   // Thay api.getAll("tickets")
          api.list("movies"),    // Thay api.getAll("movies")
          api.list("theaters"),
        ]);
        setRevenueData(rev || []);
        setTicketData(tick || []);
        setTopMovies(
          (tops || []).slice(0, 5).map((m: any) => ({
            name: m.title,
            revenue: Math.floor(Math.random() * 100_000_000),
            tickets: Math.floor(Math.random() * 1500),
          }))
        );
        setCinemas(theaters || []);
      } catch (e) {
        console.error("❌ Dashboard fetch error:", e);
      }
    })();
  }, []);

  // =============== FILTER + FIX LAT/LNG ==================

  const filteredCinemas =
    selectedCity === "Tất cả"
      ? cinemas
      : cinemas.filter((c) => c.city === selectedCity);

  // Chỉ giữ rạp có lat/lng hợp lệ
  const validCinemas = filteredCinemas.filter(
    (c) =>
      typeof c.lat === "number" &&
      !Number.isNaN(c.lat) &&
      typeof c.lng === "number" &&
      !Number.isNaN(c.lng)
  );

  // Tính center hợp lệ và an toàn
  const mapCenter: [number, number] =
    selectedCity === "Tất cả"
      ? [16.5, 106]
      : [
          validCinemas[0]?.lat ?? 16.5,
          validCinemas[0]?.lng ?? 106,
        ];

  const total = topMovies.length ? topMovies[0].revenue : 1;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Dashboard
      </h1>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { title: "Doanh thu hôm nay", value: "₫500,000", icon: faMoneyBillWave, color: "bg-green-500" },
          { title: "Vé bán ra", value: "142", icon: faTicketAlt, color: "bg-blue-500" },
          { title: "Người dùng mới", value: "37", icon: faUserPlus, color: "bg-purple-500" },
          { title: "Bình luận chờ duyệt", value: "17", icon: faComments, color: "bg-orange-500" },
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-300">{item.title}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${item.color}`}>
              <FontAwesomeIcon icon={item.icon} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow">
          <h2 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            Doanh thu theo tuần (triệu ₫)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData.length ? revenueData : [
              { day: "T2", revenue: 3.5 },
              { day: "T3", revenue: 4.2 },
              { day: "T4", revenue: 3.9 },
              { day: "T5", revenue: 5.1 },
              { day: "T6", revenue: 4.5 },
              { day: "T7", revenue: 5.8 },
              { day: "CN", revenue: 6.2 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow">
          <h2 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Vé bán ra theo tuần</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ticketData.length ? ticketData : [
              { day: "T2", sold: 150 },
              { day: "T3", sold: 120 },
              { day: "T4", sold: 170 },
              { day: "T5", sold: 210 },
              { day: "T6", sold: 160 },
              { day: "T7", sold: 190 },
              { day: "CN", sold: 250 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip />
              <Bar dataKey="sold" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Movies */}
      <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow">
        <h2 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
          Top 5 phim doanh thu cao nhất tuần
        </h2>
        <table className="w-full text-sm">
          <thead className="text-gray-600 dark:text-gray-300">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2">Tên phim</th>
              <th>Vé bán</th>
              <th>Doanh thu (₫)</th>
              <th>Tỷ lệ</th>
            </tr>
          </thead>
          <tbody>
            {topMovies.map((m, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 font-medium text-gray-800 dark:text-gray-100">{m.name}</td>
                <td className="text-center text-gray-700 dark:text-gray-300">{m.tickets}</td>
                <td className="text-center text-gray-700 dark:text-gray-300">
                  {m.revenue.toLocaleString("vi-VN")}
                </td>
                <td>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="h-2.5 bg-blue-500 rounded-full"
                      style={{ width: `${(m.revenue / total) * 100}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MAP */}
      {/* <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            Bản đồ hệ thống rạp Cinesta
          </h2>
          <select
            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-md outline-none"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option>Tất cả</option>
            {[...new Set(cinemas.map((c) => c.city))].map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="h-[400px] rounded-xl overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={selectedCity === "Tất cả" ? 6 : 11}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <MapUpdater
              center={mapCenter}
              zoom={selectedCity === "Tất cả" ? 6 : 11}
            />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {validCinemas.map((c, i) => (
              <Marker key={i} position={[c.lat, c.lng]}>
                <Popup>
                  <b>{c.name}</b>
                  <br />
                  {c.address}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div> */}
    </div>
  );
}
