import React, { useEffect, useState } from "react";
import SeatMap from "../../components/SeatMap";
import { api } from "../../../lib/api";

export default function StaffBooking() {
  const [movies, setMovies] = useState<any[]>([]);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedShowtime, setSelectedShowtime] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Lấy phim & combo
  useEffect(() => {
  api.listMovies()
    .then((res) => Array.isArray(res) ? setMovies(res) : setMovies([]))
    .catch(() => setMovies([]));

  api.listCombos()
    .then((res) => Array.isArray(res) ? setCombos(res) : setCombos([]))
    .catch(() => setCombos([]));
}, []);

useEffect(() => {
  if (selectedMovie) {
    api.listShowtimesByMovie(selectedMovie)
      .then((res) => Array.isArray(res) ? setShowtimes(res) : setShowtimes([]))
      .catch(() => setShowtimes([]));
  } else {
    setShowtimes([]);
  }
}, [selectedMovie]);

  // Xử lý đặt vé
  const handleSubmit = async () => {
    if (!selectedMovie || !selectedShowtime || selectedSeats.length === 0) {
      setMessage("⚠️ Vui lòng chọn phim, suất chiếu và ghế trước khi xác nhận!");
      return;
    }
    setLoading(true);
    try {
      await api.create("tickets", {
        movieId: selectedMovie,
        showtimeId: selectedShowtime,
        seats: selectedSeats,
        combo: selectedCombo || null,
        createdBy: "staff",
      });
      setMessage("✅ Đặt vé thành công!");
      setSelectedSeats([]);
      setSelectedCombo("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi đặt vé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Tiêu đề */}
      <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
        🎟️ Đặt vé tại quầy
      </h1>

      {/* Bộ chọn */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow">
        {/* Phim */}
        <div>
          <label className="font-medium text-gray-700">Phim</label>
          <select
            className="w-full border rounded-md p-2 mt-1"
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
          >
            <option value="">-- Chọn phim --</option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Suất chiếu */}
        <div>
          <label className="font-medium text-gray-700">Suất chiếu</label>
          <select
            className="w-full border rounded-md p-2 mt-1"
            value={selectedShowtime}
            onChange={(e) => setSelectedShowtime(e.target.value)}
          >
            <option value="">-- Chọn suất chiếu --</option>
            {showtimes.map((s) => (
              <option key={s._id} value={s._id}>
                {`${s.room?.name ?? "Phòng"} - ${new Date(
                  s.startTime
                ).toLocaleString()}`}
              </option>
            ))}
          </select>
        </div>

        {/* Combo */}
        <div>
          <label className="font-medium text-gray-700">Combo</label>
          <select
            className="w-full border rounded-md p-2 mt-1"
            value={selectedCombo}
            onChange={(e) => setSelectedCombo(e.target.value)}
          >
            <option value="">-- Chọn combo --</option>
            {combos.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} - {c.price?.toLocaleString()}đ
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sơ đồ ghế */}
      <div className="bg-gray-50 rounded-xl shadow-sm p-4">
        <SeatMap rows={12} leftCols={3} midCols={10} rightCols={3} onChange={setSelectedSeats} />
      </div>

      {/* Thông tin vé */}
      <div className="border-t pt-4 text-sm text-gray-700">
        <p>
          <strong>Phim:</strong>{" "}
          {movies.find((m) => m._id === selectedMovie)?.title || "--"}
        </p>
        <p>
          <strong>Suất chiếu:</strong>{" "}
          {showtimes.find((s) => s._id === selectedShowtime)
            ? new Date(
                showtimes.find((s) => s._id === selectedShowtime).startTime
              ).toLocaleString()
            : "--"}
        </p>
        <p>
          <strong>Ghế đã chọn:</strong>{" "}
          {selectedSeats.length ? selectedSeats.join(", ") : "--"}
        </p>
      </div>

      {/* Tổng tiền + nút */}
      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-lg font-semibold">
          Tổng tiền:{" "}
          <span className="text-emerald-600">{total.toLocaleString()}đ</span>
        </p>
        <button
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Xác nhận đặt vé"}
        </button>
      </div>

      {/* Thông báo */}
      {message && (
        <p className="text-center text-sm text-gray-600 mt-2">{message}</p>
      )}
    </div>
  );
}
