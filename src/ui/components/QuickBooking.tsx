import React, { useMemo, useState } from "react";
import CustomSelect from "./CustomSelect";
import { useCollection } from "../../lib/mockCrud";

type Movie = { id: string | number; title: string };
type Cinema = { id: string | number; name: string; city?: string };
type Showtime = {
  id: string | number;
  movieId: string | number;
  cinemaId: string | number;
  start?: string; // ISO
  end?: string; // ISO
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
  const { rows: movieRows = [] } = useCollection<Movie>("movies" as any);
  const { rows: cinemaRows = [] } = useCollection<Cinema>("cinemas" as any);
  const { rows: showtimeRows = [] } = useCollection<Showtime>("showtimes" as any);

  const movies = (movieRows.length
    ? movieRows
    : [
        { id: 1, title: "Nhà Ma Xó" },
        { id: 2, title: "Cục Vàng Của Ngoại" },
        { id: 3, title: "Cái Mả" },
      ]
  ).map((m) => ({ value: String(m.id), label: m.title }));

  const cinemas = (cinemaRows.length
    ? cinemaRows
    : [
        { id: 1, name: "Only Cinema Quận 1" },
        { id: 2, name: "Only Cinema Tân Bình" },
      ]
  ).map((c) => ({ value: String(c.id), label: c.name }));

  const [movieId, setMovieId] = useState("");
  const [cinemaId, setCinemaId] = useState("");
  const [date, setDate] = useState(next7Days()[0].value);
  const [showId, setShowId] = useState("");

  const dateOptions = next7Days();

  const showOptions = useMemo(() => {
    const base = showtimeRows.length
      ? showtimeRows
      : [
          { id: 11, movieId: "1", cinemaId: "1", start: `${date}T19:00:00` },
          { id: 12, movieId: "1", cinemaId: "1", start: `${date}T21:15:00` },
          { id: 13, movieId: "2", cinemaId: "2", start: `${date}T20:00:00` },
        ];

    return base
      .filter((s) => {
        // ✅ bảo vệ null/undefined
        if (!s || !s.start) return false;
        return (
          (!movieId || String(s.movieId) === movieId) &&
          (!cinemaId || String(s.cinemaId) === cinemaId) &&
          s.start.startsWith(date)
        );
      })
      .map((s) => ({
        value: String(s.id),
        label:
          new Date(s.start!).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }) +
          (s.end
            ? ` – ${new Date(s.end).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : ""),
      }));
  }, [showtimeRows, movieId, cinemaId, date]);

  const handleBuy = () => {
    if (!showId) {
      alert("⚠️ Vui lòng chọn đầy đủ thông tin!");
      return;
    }
    alert(
      `🎟️ Mua vé nhanh:\nPhim: ${movieId}\nRạp: ${cinemaId}\nNgày: ${date}\nSuất: ${showId}`
    );
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
            value={cinemaId}
            placeholder="Chọn Rạp"
            options={cinemas}
            onChange={setCinemaId}
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
