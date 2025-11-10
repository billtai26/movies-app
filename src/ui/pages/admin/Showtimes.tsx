import React, { useEffect, useState } from "react";
import CrudTable from "../../components/CrudTable";
import { api } from "../../../lib/api";

// helper: Date -> value cho <input type="datetime-local">
const toLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  // YYYY-MM-DDTHH:mm (local)
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// helper: value từ <input datetime-local> -> ISO (giữ clock time người dùng)
const fromLocalInputToISO = (v?: string) => {
  if (!v) return "";
  // Chuỗi "YYYY-MM-DDTHH:mm" được parse theo local -> .toISOString() để lưu nhất quán UTC
  const d = new Date(v);
  return d.toISOString();
};

export default function Showtimes() {
  const [movies, setMovies] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const m = await api.getAll("movies");    // [{_id,title}]
      const t = await api.getAll("theaters");  // [{_id,name}]
      setMovies(m?.data || m || []);
      setTheaters(t?.data || t || []);
    })();
  }, []);

  const schema: any = {
    name: "showtimes",
    title: "Lịch chiếu",
    columns: [
      { key: "movie", label: "Phim" },
      { key: "cinema", label: "Rạp/Cụm" },
      { key: "seatsPreview", label: "Ghế" },
      {
        key: "startTime",
        label: "Bắt đầu",
        // hiển thị 19:00 22/10/2025
        render: (v: any) =>
          v ? new Date(v).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "—",
      },
      {
        key: "endTime",
        label: "Kết thúc",
        render: (v: any) =>
          v ? new Date(v).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "—",
      },
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
        key: "cinema",
        label: "Rạp/Cụm",
        type: "select",
        required: true,
        options: theaters.map((t) => ({ label: t.name, value: t._id })),
      },
      { key: "room", label: "Phòng chiếu", placeholder: "VD: Phòng 1, Phòng 2" },
      { key: "startTime", label: "Thời gian bắt đầu", type: "datetime", required: true },
      { key: "endTime",   label: "Thời gian kết thúc", type: "datetime", required: true },
      { key: "price",     label: "Giá vé (VNĐ)", type: "number", placeholder: "Nhập giá vé" },
      { key: "seats",     label: "Danh sách ghế", type: "textarea", placeholder: "A1,A2,B1,B2..." },
    ],

    // Lấy chi tiết để Sửa/Xem (có id + tên + ISO date)
    fetchOne: async (id: string) => {
      const res = await api.getOne("showtimes", id);
      return res?.data || res;
    },

    // Map dữ liệu detail -> form
    toForm: (s: any) => ({
      id: s.id,
      movie: s.movie || "",        // id
      cinema: s.cinema || "",      // id
      room: s.room || "",
      startTime: toLocalInput(s.startTime),
      endTime: toLocalInput(s.endTime),
      price: s.price ?? 0,
      seats: Array.isArray(s.seats) ? s.seats.map((x: any) => x.seatNumber).join(",") : (s.seats || ""),
      // dùng riêng cho readOnly hiển thị tên
      movieName: s.movieName,
      cinemaName: s.cinemaName,
    }),

    // Map form -> payload cho BE
    toPayload: (form: any) => ({
      movie: form.movie,            // -> movieId
      cinema: form.cinema,          // -> theaterId
      room: form.room,
      startTime: fromLocalInputToISO(form.startTime),
      endTime:   fromLocalInputToISO(form.endTime),
      price: Number(form.price) || 0,
      seats: form.seats,            // chuỗi "A1,A2..." (BE sẽ convert)
    }),
  };

  return <CrudTable schema={schema} />;
}
