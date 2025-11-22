import React, { useEffect, useState } from "react";
import CrudTable from "../../components/CrudTable";
import { EntitySchema } from "../../../types/entities";

export default function RoomsSeats() {
  const schema: EntitySchema = {
    name: "rooms",
    title: "Phòng & Ghế",
    columns: [
      { key: "roomName", label: "Phòng" },
      { key: "theaterName", label: "Rạp/Cụm" },
      { key: "seatCount", label: "Số ghế" },
      { key: "type", label: "Loại phòng" },
    ],
    fields: [
      { key: "roomName", label: "Tên phòng", type: "text", required: true },
      {
        key: "theater",
        label: "Rạp/Cụm",
        type: "select",
        options: theaterOptions,
        required: true,
        placeholder: "Chọn rạp...",
      },
      {
        key: "seatCount",
        label: "Số ghế",
        type: "number",
        required: true,
        placeholder: "VD: 80",
      },
      {
        key: "type",
        label: "Loại phòng",
        type: "select",
        options: [
          { label: "2D", value: "2D" },
          { label: "3D", value: "3D" },
          { label: "VIP", value: "VIP" },
        ],
      },
      {
        key: "layout",
        label: "Cấu hình hàng ghế",
        type: "layout",
        placeholder: "Thêm hàng ghế (A, 10 ghế, loại STANDARD/VIP)",
      },
    ],

    // ⚙️ Map dữ liệu form → payload gửi lên BE
    toPayload(form: any) {
      // chuyển layout → seats[]
      const seats = Array.isArray(form.layout)
        ? form.layout.flatMap((row: any) =>
            Array.from({ length: row.count }).map((_, i) => ({
              seatNumber: `${row.row}${i + 1}`,
              type: row.type,
            }))
          )
        : [];

      return {
        roomName: form.roomName,
        theater: form.theater,
        seatCount: form.seatCount ?? seats.length,
        type: form.type ?? "2D",
        seats,
      };
    },

    // 🧩 Map BE → form (để sửa)
    toForm(item: any) {
      if (!item?.seats) return item;
      const grouped: Record<string, any[]> = {};
      item.seats.forEach((s: any) => {
        const row = s.seatNumber?.[0] || "?";
        grouped[row] = grouped[row] || [];
        grouped[row].push(s);
      });

      const layout = Object.entries(grouped).map(([row, arr]) => ({
        row,
        count: arr.length,
        type: arr[0]?.type || "STANDARD",
      }));

      return { ...item, layout };
    },
  };

  return <CrudTable schema={schema as any} />;
}
