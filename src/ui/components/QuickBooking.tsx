import React, { useMemo, useState } from "react";
import CustomSelect from "./CustomSelect";
import { useCollection } from "../../lib/mockCrud";
import { useNavigate } from "react-router-dom";

type Movie = { _id: string; title: string };
type Theater = { _id: string; name: string; city?: string };
type Showtime = {
  _id: string;
  movie: string | { _id: string; title: string };
  theater: string | { _id: string; name: string };
  startTime?: string;
  endTime?: string;
};

function next7Days() {
  const list: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const value = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
    list.push({ value, label });
  }
  return list;
}

export default function QuickBooking() {
  const nav = useNavigate();
  const { rows: movieRows = [] } = useCollection<Movie>("movies");
  const { rows: theaterRows = [] } = useCollection<Theater>("theaters");
  const { rows: showtimeRows = [] } = useCollection<Showtime>("showtimes");

  const movies = movieRows.map((m) => ({
    value: String(m._id),
    label: m.title,
  }));

  const theaters = theaterRows.map((t) => ({
    value: String(t._id),
    label: t.name + (t.city ? ` (${t.city})` : ""),
  }));

  const [movieId, setMovieId] = useState("");
  const [theaterId, setTheaterId] = useState("");
  const [date, setDate] = useState(next7Days()[0].value);
  const [showId, setShowId] = useState("");

  const dateOptions = next7Days();

  // 🎬 Lọc danh sách suất chiếu theo phim + rạp + ngày
  const showOptions = useMemo(() => {
    const list = showtimeRows
      .filter((s) => {
        if (!s.startTime) return false;
        const sameMovie =
          !movieId ||
          movieId === (typeof s.movie === "object" ? s.movie._id : s.movie);
        const sameTheater =
          !theaterId ||
          theaterId === (typeof s.theater === "object"
            ? s.theater._id
            : s.theater);
        const sameDay = s.startTime.startsWith(date);
        return sameMovie && sameTheater && sameDay;
      })
      .map((s) => ({
        value: String(s._id),
        label:
          new Date(s.startTime!).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }) +
          (s.endTime
            ? ` – ${new Date(s.endTime).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : ""),
      }));
    return list;
  }, [showtimeRows, movieId, theaterId, date]);

  // 🟠 Xử lý đặt vé nhanh
  const handleBuy = () => {
    if (!movieId || !theaterId || !showId) {
      alert("⚠️ Vui lòng chọn đầy đủ thông tin!");
      return;
    }
    nav(`/booking/select?showtime=${showId}`);
  };

  return (
    <div className="bg-white/90 rounded-xl shadow-sm border border-gray-200 -mt-6 lg:-mt-8 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 p-3 md:p-4">
        <div className="col-span-2 md:col-span-1">
          <CustomSelect
            value={movieId}
            placeholder="Chọn Phim"
            options={movies}
            onChange={setMovieId}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <CustomSelect
            value={theaterId}
            placeholder="Chọn Rạp"
            options={theaters}
            onChange={setTheaterId}
          />
        </div>
        <div className="col-span-1">
          <CustomSelect
            value={date}
            placeholder="Chọn Ngày"
            options={dateOptions}
            onChange={setDate}
          />
        </div>
        <div className="col-span-1">
          <CustomSelect
            value={showId}
            placeholder="Chọn Suất"
            options={showOptions}
            onChange={setShowId}
          />
        </div>
        <div className="col-span-2 md:col-span-1 flex">
          <button
            className="w-full rounded-md bg-[#f58a1f] hover:bg-[#f07a00] text-white font-medium px-4"
            onClick={handleBuy}
          >
            Mua vé nhanh
          </button>
        </div>
      </div>
    </div>
  );
}
