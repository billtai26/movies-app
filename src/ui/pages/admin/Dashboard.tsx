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

// ================= MOCK DATA =================

const revenueData = [
  { day: "T2", revenue: 3.5 },
  { day: "T3", revenue: 4.2 },
  { day: "T4", revenue: 3.9 },
  { day: "T5", revenue: 5.1 },
  { day: "T6", revenue: 4.5 },
  { day: "T7", revenue: 5.8 },
  { day: "CN", revenue: 6.2 },
];
const ticketData = [
  { day: "T2", sold: 150 },
  { day: "T3", sold: 120 },
  { day: "T4", sold: 170 },
  { day: "T5", sold: 210 },
  { day: "T6", sold: 160 },
  { day: "T7", sold: 190 },
  { day: "CN", sold: 250 },
];
const topMovies = [
  { name: "Tron Ares", revenue: 95000000, tickets: 1200 },
  { name: "Avatar 3", revenue: 88000000, tickets: 1050 },
  { name: "The Conjuring", revenue: 76500000, tickets: 990 },
  { name: "Venom 3", revenue: 70200000, tickets: 870 },
  { name: "Inside Out 2", revenue: 65500000, tickets: 820 },
];

const cinemas = [
  { name: "Only Cinema Hà Nội", lat: 21.0278, lng: 105.8342, city: "Hà Nội", address: "12 Hai Bà Trưng, Hà Nội" },
  { name: "Only Cinema Đà Nẵng", lat: 16.0544, lng: 108.2022, city: "Đà Nẵng", address: "35 Nguyễn Văn Linh, Đà Nẵng" },
  { name: "Only Cinema TP.HCM", lat: 10.7769, lng: 106.7009, city: "TP.HCM", address: "123 Lê Lợi, Quận 1, TP.HCM" },
  { name: "Only Cinema Cần Thơ", lat: 10.0452, lng: 105.7469, city: "Cần Thơ", address: "22 Nguyễn Trãi, Cần Thơ" },
  { name: "Only Cinema Hải Phòng", lat: 20.8449, lng: 106.6881, city: "Hải Phòng", address: "78 Lạch Tray, Hải Phòng" },
];

// ================= MAP ICON =================
const cinemaIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// ================= MapUpdater COMPONENT =================
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

// ================= MAIN DASHBOARD =================
export default function AdminDashboard() {
  const [selectedCity, setSelectedCity] = useState<string>("Tất cả");
  const total = topMovies[0].revenue;
  const axisColor = document.documentElement.classList.contains("dark")
    ? "#e5e7eb"
    : "#1f2937";

  const filteredCinemas =
    selectedCity === "Tất cả"
      ? cinemas
      : cinemas.filter((c) => c.city === selectedCity);

  const mapCenter =
    selectedCity === "Tất cả"
      ? [16.5, 106]
      : [filteredCinemas[0].lat, filteredCinemas[0].lng];

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { title: "Doanh thu hôm nay", value: "₫36,500,000", icon: faMoneyBillWave, color: "bg-green-500" },
          { title: "Vé bán ra", value: "1,042", icon: faTicketAlt, color: "bg-blue-500" },
          { title: "Người dùng mới", value: "37", icon: faUserPlus, color: "bg-purple-500" },
          { title: "Bình luận chờ duyệt", value: "17", icon: faComments, color: "bg-orange-500" },
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-xl bg-white shadow flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="text-xl font-bold text-gray-900">{item.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${item.color}`}>
              <FontAwesomeIcon icon={item.icon} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white shadow">
          <h2 className="mb-2 font-semibold text-gray-900">Doanh thu theo tuần (triệu ₫)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 rounded-xl bg-white shadow">
          <h2 className="mb-2 font-semibold text-gray-900">Vé bán ra theo tuần</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ticketData}>
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
      <div className="p-4 rounded-xl bg-white shadow">
        <h2 className="mb-3 font-semibold text-gray-900">Top 5 phim doanh thu cao nhất tuần</h2>
        <table className="w-full text-sm">
          <thead className="text-gray-600">
            <tr className="border-b border-gray-200">
              <th className="text-left py-2">Tên phim</th>
              <th>Vé bán</th>
              <th>Doanh thu (₫)</th>
              <th>Tỷ lệ</th>
            </tr>
          </thead>
          <tbody>
            {topMovies.map((m, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 font-medium text-gray-800">{m.name}</td>
                <td className="text-center text-gray-700">{m.tickets}</td>
                <td className="text-center text-gray-700">{m.revenue.toLocaleString("vi-VN")}</td>
                <td>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
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

      {/* MAP SECTION */}
      <div className="p-4 rounded-xl bg-white shadow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Bản đồ hệ thống rạp Only Cinema</h2>
          <select
            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md outline-none"
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
          <MapContainer className="h-full w-full">
            {/* 👇 MapUpdater giúp tự pan khi đổi khu vực */}
            <MapUpdater
              center={mapCenter as [number, number]}
              zoom={selectedCity === "Tất cả" ? 6 : 11}
            />

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              {...({ attribution: '&copy; OpenStreetMap contributors' } as any)}
            />
            {filteredCinemas.map((c, i) => (
              <Marker key={i} position={[c.lat, c.lng]} {...({ icon: cinemaIcon } as any)}>
                <Popup>
                  <b>{c.name}</b>
                  <br />
                  {c.address}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
