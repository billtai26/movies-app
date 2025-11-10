import React, { useEffect, useState } from "react";
import CrudTable from "../../components/CrudTable";

export default function RoomsSeats() {
  const [cinemaOptions, setCinemaOptions] = useState([]);

  // 🟢 Load danh sách rạp thật từ Mongo
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await fetch("http://localhost:8017/api/theaters");
        const json = await res.json();
        const opts = json.data.map((c) => ({ label: c.name, value: c._id }));
        setCinemaOptions(opts);
      } catch (err) {
        console.error("Lỗi load rạp:", err);
      }
    };
    fetchCinemas();
  }, []);

  const schema = {
    name: "roomsseats",
    title: "Phòng & Ghế",
    columns: [
      { key: "name", label: "Phòng" },
      { key: "cinema", label: "Rạp/Cụm" },
      { key: "seatsPreview", label: "Ghế" },
    ],
    fields: [
      { key: "name", label: "Tên phòng", type: "text", required: true },
      {
        key: "cinema",
        label: "Rạp/Cụm",
        type: "select",
        required: true,
        options: cinemaOptions,
      },
      {
        key: "layout",
        label: "Cấu hình hàng ghế",
        type: "layout",
        placeholder: "Thêm hàng ghế (A, 10 ghế, loại STANDARD/VIP)",
      },
    ],
  };

  return <CrudTable schema={schema} />;
}
