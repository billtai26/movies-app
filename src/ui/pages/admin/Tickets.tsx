// src/ui/pages/admin/Tickets.tsx
import React, { useEffect, useState } from "react";
import CrudTable from "../../components/CrudTable";
import { api } from "../../../lib/api";

export default function AdminTickets() {
  const [users, setUsers] = useState<any[]>([]);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);

  // 🟢 Load dữ liệu
  useEffect(() => {
    (async () => {
      try {
        const [uData, sData, mData] = await Promise.all([
            api.list("users", { limit: 1000 }),
            api.list("showtimes", { limit: 1000 }),
            api.list("movies", { limit: 1000 })
        ]);

        const safeArray = (data: any) => {
            if (Array.isArray(data)) return data;
            if (data?.data && Array.isArray(data.data)) return data.data; 
            if (data?.users && Array.isArray(data.users)) return data.users;
            if (data?.showtimes && Array.isArray(data.showtimes)) return data.showtimes;
            if (data?.movies && Array.isArray(data.movies)) return data.movies;
            if (data?.results && Array.isArray(data.results)) return data.results;
            return [];
        };

        setUsers(safeArray(uData));
        setShowtimes(safeArray(sData));
        setMovies(safeArray(mData));
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
      }
    })();
  }, []);

  const formatTime = (isoString: string) => {
      if (!isoString) return "";
      const raw = isoString.replace("Z", ""); 
      const d = new Date(raw);
      return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  };

  const schema = {
    name: "tickets",
    title: "Vé / Hóa đơn",

    toForm: (data: any) => {
      const clone = { ...data };
      if (clone.showtimeId && typeof clone.showtimeId === 'object') {
          clone.showtimeId = clone.showtimeId._id || clone.showtimeId.id;
      }
      if (clone.userId && typeof clone.userId === 'object') {
          clone.userId = clone.userId._id || clone.userId.id;
      }
      if (Array.isArray(clone.seats)) {
        clone.seats = clone.seats.map((s: any) => {
            if (typeof s === 'object') return `${s.row}${s.number}`;
            return s;
        }).join(",");
      }
      return clone;
    },

    columns: [
      { key: "_id", label: "Mã vé" },
      { 
        key: "userId", 
        label: "Người đặt",
        render: (row: any) => {
            if (row.userId && typeof row.userId === 'object') {
                return row.userId.username || row.userId.email || "Khách ẩn danh";
            }
            const user = users.find(u => u._id === row.userId);
            return user ? (user.username || user.email) : "Khách ẩn danh";
        }
      },
      {
          key: "showtimeId",
          label: "Phim & Suất chiếu", 
          render: (row: any) => {
              let s = (row.showtimeId && typeof row.showtimeId === 'object') 
                    ? row.showtimeId 
                    : showtimes.find(x => x._id === row.showtimeId);

              if (!s) return "---";

              let mTitle = "Phim ẩn";
              if (s.movieId && typeof s.movieId === 'object') mTitle = s.movieId.title;
              else {
                  const m = movies.find(x => x._id === s.movieId);
                  if (m) mTitle = m.title;
              }

              return `${mTitle} (${formatTime(s.startTime)})`; 
          }
      },
      { 
        key: "seats", 
        label: "Ghế",
        render: (row: any) => {
          if (Array.isArray(row.seats)) {
            return row.seats.map((s: any) => (typeof s === 'object' ? `${s.row}${s.number}` : s)).join(", ");
          }
          return row.seats || "";
        }
      },
      { 
          key: "paymentStatus", 
          label: "Thanh toán",
          render: (row: any) => {
             const map: any = { pending: "Chờ", completed: "✅ Đã xong", failed: "❌ Thất bại" };
             return map[row.paymentStatus] || row.paymentStatus;
          }
      },
      { 
          key: "totalAmount", 
          label: "Tổng tiền",
          render: (row: any) => Number(row.totalAmount).toLocaleString('vi-VN') + ' ₫'
      },
    ],
    fields: [
      {
        key: "userId",
        label: "Người đặt",
        type: "select",
        required: true,
        options: users.map((u) => ({ 
            label: u.name || u.email || "Unknown", 
            value: u._id 
        })),
        readonlyOnEdit: true // 🔒 KHÓA
      },
      {
        key: "showtimeId",
        label: "Lịch chiếu",
        type: "select",
        required: true,
        options: showtimes.map((s) => {
            const movie = movies.find(m => m._id === s.movieId);
            const movieName = movie ? movie.title : (s.movieTitle || "Phim chưa rõ");
            return {
                label: `${movieName} - ${formatTime(s.startTime)}`,
                value: s._id,
            };
        }),
        readonlyOnEdit: true // 🔒 KHÓA
      },
      { 
          key: "seats", 
          label: "Ghế", 
          type: "text", 
          required: true, 
          readonlyOnEdit: true // 🔒 KHÓA (đã có từ trước)
      },
      { 
          key: "totalAmount", 
          label: "Tổng tiền (₫)", 
          type: "number", 
          required: true,
          readonlyOnEdit: true // 🔒 KHÓA
      },
      {
        key: "bookingStatus",
        label: "Trạng thái Đặt",
        type: "select",
        required: true,
        options: [
          { label: "Đã đặt (Active)", value: "active" },
          { label: "Đã hủy (Cancelled)", value: "cancelled" },
        ],
        readonlyOnEdit: true // 🔒 KHÓA (Admin không được tự ý hủy vé ở đây nếu chỉ muốn chỉnh thanh toán)
      },
      // 👇 CHỈ TRƯỜNG NÀY LÀ KHÔNG CÓ readonlyOnEdit
      {
        key: "paymentStatus",
        label: "Trạng thái Thanh toán",
        type: "select",
        required: true,
        options: [
            { label: "Chờ thanh toán", value: "pending" },
            { label: "Đã thanh toán", value: "completed" },
            { label: "Thất bại", value: "failed" },
        ]
      },
      {
        key: "paymentMethod",
        label: "Phương thức thanh toán",
        type: "select",
        options: [
          { label: "Tiền mặt", value: "cash" },
          { label: "ZaloPay", value: "zalopay" },
          { label: "VNPay", value: "vnpay" },
          { label: "Momo", value: "momo" },
        ],
        readonlyOnEdit: true // 🔒 KHÓA
      },
    ],
  };

  return <CrudTable schema={schema as any} canCreate={false} />;
}