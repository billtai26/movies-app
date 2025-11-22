// client/src/ui/pages/admin/Tickets.tsx
import React, { useEffect, useState } from "react";
import CrudTable from "../../components/CrudTable";
import { api } from "../../../lib/api";

export default function AdminTickets() {
  const [users, setUsers] = useState<any[]>([]);
  const [showtimes, setShowtimes] = useState<any[]>([]);

  // 🟢 Load user + showtime thật từ BE
  useEffect(() => {
    (async () => {
      try {
        const u = await api.getAll("users");
        const s = await api.getAll("showtimes");
        setUsers(u?.data || u || []);
        setShowtimes(s?.data || s || []);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
      }
    })();
  }, []);

  const schema = {
    name: "tickets",
    title: "Vé / Hóa đơn",
    columns: [
      { key: "invoiceCode", label: "Mã vé" },
      { key: "userName", label: "Người đặt" },
      { key: "status", label: "Trạng thái" },
      { key: "totalPrice", label: "Tổng tiền (₫)" },
    ],
    fields: [
      { key: "invoiceCode", label: "Mã vé", type: "text", required: true },
      {
        key: "user",
        label: "Người đặt",
        type: "select",
        required: true,
        options: users.map((u) => ({ label: u.name || u.email, value: u._id })),
      },
      {
        key: "showtime",
        label: "Lịch chiếu",
        type: "select",
        required: true,
        options: showtimes.map((s) => ({
          label: `${s.movieTitle || "Phim"} - ${new Date(
            s.startTime
          ).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          })}`,
          value: s._id,
        })),
      },
      { key: "seats", label: "Ghế (VD: A1,A2...)", type: "text", required: true },
      { key: "totalPrice", label: "Tổng tiền (₫)", type: "number", required: true },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        required: true,
        options: [
          { label: "Đã đặt", value: "booked" },
          { label: "Đã thanh toán", value: "paid" },
          { label: "Đã hủy", value: "canceled" },
        ],
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
      },
    ],
  };

  return <CrudTable schema={schema as any} />;
}
