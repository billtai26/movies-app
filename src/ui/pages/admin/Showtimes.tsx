import React, { useEffect, useState } from "react";
import CrudTable from "../../components/CrudTable";
import { api } from "../../../lib/api";

// Helper: format datetime-local
const toLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Helper: convert back to ISO
const fromLocalInputToISO = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return d.toISOString();
};

export default function AdminShowtimes() {
  const [movies, setMovies] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  // 🟢 Load phim, rạp, phòng từ BE
  useEffect(() => {
    (async () => {
      try {
        const [m, t, r] = await Promise.all([
          api.getAll("movies"),
          api.getAll("theaters"),
          api.getAll("roomsseats"),
        ]);
        setMovies(m?.data || m || []);
        setTheaters(t?.data || t || []);
        setRooms(r?.data || r || []);
      } catch (e) {
        console.error("❌ Lỗi tải dữ liệu:", e);
      }
    })();
  }, []);

  const schema: any = {
    name: "showtimes",
    title: "Lịch chiếu",
    columns: [
      { key: "movieName", label: "Phim" },
      { key: "theaterName", label: "Rạp" },
      { key: "roomName", label: "Phòng" },
      {
        key: "startTime",
        label: "Bắt đầu",
        render: (v: any) =>
          v
            ? new Date(v).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
              })
            : "—",
      },
      {
        key: "endTime",
        label: "Kết thúc",
        render: (v: any) =>
          v
            ? new Date(v).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
              })
            : "—",
      },
      { key: "price", label: "Giá vé (₫)" },
    ],

    fields: [
      {
        key: "movie",
        label: "Phim",
        type: "select",
        required: true,
        options: movies.map((m) => ({ label: m.title, value: m._id })),
      },
      {
        key: "theater",
        label: "Rạp/Cụm",
        type: "select",
        required: true,
        options: theaters.map((t) => ({ label: t.name, value: t._id })),
      },
      {
        key: "roomSeat",
        label: "Phòng chiếu",
        type: "select",
        required: true,
        options: rooms.map((r) => ({ label: r.roomName, value: r._id })),
      },
      {
        key: "startTime",
        label: "Thời gian bắt đầu",
        type: "datetime",
        required: true,
      },
      {
        key: "endTime",
        label: "Thời gian kết thúc",
        type: "datetime",
        required: true,
      },
      {
        key: "price",
        label: "Giá vé (VNĐ)",
        type: "number",
        placeholder: "Nhập giá vé",
      },
    ],

    // 🧭 Lấy chi tiết 1 lịch chiếu
    fetchOne: async (id: string) => {
      const res = await api.getOne("showtimes", id);
      return res?.data || res;
    },

    // 🧩 Map dữ liệu từ BE -> form
    toForm: (s: any) => ({
      id: s._id,
      movie: s.movie?._id || s.movie,
      theater: s.theater?._id || s.theater,
      roomSeat: s.roomSeat?._id || s.roomSeat,
      startTime: toLocalInput(s.startTime),
      endTime: toLocalInput(s.endTime),
      price: s.price ?? 0,
      movieName: s.movie?.title || s.movieName,
      theaterName: s.theater?.name || s.theaterName,
      roomName: s.roomSeat?.roomName || s.roomName,
    }),

    // 🧭 Map form -> payload cho BE
    toPayload: (form: any) => ({
      movie: form.movie,
      theater: form.theater,
      roomSeat: form.roomSeat,
      startTime: fromLocalInputToISO(form.startTime),
      endTime: fromLocalInputToISO(form.endTime),
      price: Number(form.price) || 0,
    }),
  };

  return <CrudTable schema={schema} />;
}
