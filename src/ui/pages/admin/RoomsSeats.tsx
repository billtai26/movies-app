import React, { useEffect, useState } from "react";
import CrudTable from "../../components/CrudTable";
import { api } from "../../../lib/backendApi"; // Import api wrapper
import { FieldSchema } from "../../../types/entities";

export default function AdminRoomsSeats() {
  const [theaterOptions, setTheaterOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // 1. Dùng api.listTheaters() thay vì fetch hardcode
  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const data = await api.listTheaters();
        console.log("Debug - Dữ liệu rạp trả về:", data);

        // --- SỬA ĐOẠN NÀY ---
        // API trả về object { cinemas: [...] }, nên ta phải lấy data.cinemas
        const list = Array.isArray(data) 
          ? data 
          : (data?.cinemas || data?.data || []); 
        // --------------------

        const opts = list.map((c: any) => ({
          label: c.name, 
          value: c._id,
        }));
        
        setTheaterOptions(opts);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách rạp:", err);
      }
    };
    fetchTheaters();
  }, []);

  // 2. Định nghĩa Schema
  const schema = {
    name: "cinemaHalls", // Tên này phải khớp với backendApi case 'cinemaHalls'
    title: "Phòng & Ghế",
    columns: [
      { key: "name", label: "Tên phòng" }, // BE trả về 'name' chứ không phải 'roomName'? Hãy check lại model
      { key: "theater", label: "Rạp/Cụm", type: "text" }, // CrudTable có thể cần xử lý hiển thị object theater
      { key: "seatCount", label: "Số ghế" },
      { key: "type", label: "Loại phòng" },
    ],
    fields: [
      { key: "name", label: "Tên phòng", type: "text", required: true },
      {
        key: "theater", // Field này gửi lên BE là theater ID
        label: "Rạp/Cụm",
        type: "select",
        options: theaterOptions,
        required: true,
        placeholder: "Chọn rạp...",
      },
      {
        key: "type",
        label: "Loại phòng",
        type: "select",
        options: [
          { label: "2D", value: "2D" },
          { label: "3D", value: "3D" },
          { label: "IMAX", value: "IMAX" },
        ],
      },
      // Field ảo 'layout' dùng để render giao diện nhập ghế
      {
        key: "layout",
        label: "Cấu hình hàng ghế",
        type: "layout", // Cần đảm bảo CrudModal/CrudTable handle type này
        placeholder: "Thêm hàng ghế (A, 10 ghế, loại STANDARD/VIP)",
      },
    ] as FieldSchema[],

    // 3. Xử lý Payload: Form UI -> API
    // ⚙️ Map dữ liệu form → payload gửi lên BE
    toPayload(form: any) {
      // 1. Chuyển đổi layout từ UI thành mảng ghế phẳng (seatLayout)
      const seatLayout = Array.isArray(form.layout)
        ? form.layout.flatMap((row: any) =>
            Array.from({ length: Number(row.count) }).map((_, i) => ({
              seatNumber: `${row.row}${i + 1}`,
              type: row.type || "STANDARD",
              status: "available"
            }))
          )
        : [];

      // 2. Trả về object đúng tên trường BE yêu cầu
      return {
        name: form.roomName || form.name, // BE thường dùng 'name'
        
        // 👉 Sửa: Map 'theater' -> 'cinemaId'
        cinemaId: form.theater, 
        
        // 👉 Sửa: Map 'type' -> 'cinemaType'
        cinemaType: form.type || "2D",
        
        seatCount: form.seatCount ?? seatLayout.length,
        
        // 👉 Sửa: Map mảng ghế vào 'seatLayout' (thay vì 'seats')
        seatLayout: seatLayout, 
      };
    },

    // 4. Xử lý Form: API -> Form UI (khi bấm Edit)
    toForm(item: any) {
      // Nếu không có seats, trả về nguyên bản
      if (!item?.seats || item.seats.length === 0) return { ...item, layout: [] };

      // Group ghế theo hàng (A, B, C...) để hiển thị lại vào UI
      const grouped: Record<string, any[]> = {};
      item.seats.forEach((s: any) => {
        // Giả sử seatNumber dạng "A1", "A10" -> lấy chữ cái đầu
        const rowChar = s.seatNumber.match(/[A-Z]+/)?.[0] || "?";
        if (!grouped[rowChar]) grouped[rowChar] = [];
        grouped[rowChar].push(s);
      });

      const layout = Object.entries(grouped)
        .sort((a, b) => a[0].localeCompare(b[0])) // Sắp xếp A -> Z
        .map(([row, arr]) => ({
          row,
          count: arr.length,
          type: arr[0]?.type || "STANDARD",
        }));

      // Map theater object sang theater ID cho thẻ select (nếu BE trả về theater là object populate)
      const theaterId = (typeof item.theater === 'object' && item.theater !== null) 
          ? item.theater._id 
          : item.theater;

      return { 
          ...item, 
          theater: theaterId,
          layout 
      };
    },
  };

  return <CrudTable schema={schema as any} />;
}
