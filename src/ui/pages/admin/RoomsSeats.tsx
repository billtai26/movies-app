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
        // console.log("Debug - Dữ liệu rạp trả về:", data);

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
    name: "cinemaHalls", 
    title: "Phòng & Ghế",
    columns: [
      { key: "name", label: "Tên phòng" },
      { key: "theater", label: "Rạp" },
      { key: "seatCount", label: "Tổng ghế" },
      { key: "cinemaType", label: "Loại" }, // Hiển thị cinemaType
    ],
    fields: [
      { key: "name", label: "Tên phòng", type: "text", required: true },
      {
        key: "theater",
        label: "Rạp/Cụm",
        type: "select",
        options: theaterOptions,
        required: true,
      },
      {
        key: "cinemaType",
        label: "Loại phòng",
        type: "select",
        options: [
          { label: "2D", value: "2D" },
          { label: "3D", value: "3D" },
          { label: "IMAX", value: "IMAX" },
        ],
        defaultValue: "2D"
      },

      // --- CÁC TRƯỜNG CẤU HÌNH MỚI ---
      { 
        key: "inputRows", 
        label: "Danh sách Hàng (cách nhau dấu phẩy)", 
        type: "text", 
        placeholder: "A, B, C, D, E, F", 
        required: true 
      },
      { 
        key: "seatsPerRow", 
        label: "Số ghế mỗi hàng", 
        type: "number", 
        placeholder: "10", 
        required: true 
      },
      { 
        key: "inputVip", 
        label: "Hàng VIP (cách nhau dấu phẩy)", 
        type: "text", 
        placeholder: "C, D" 
      },
      { 
        key: "inputCouple", 
        label: "Hàng Đôi/Couple (cách nhau dấu phẩy)", 
        type: "text", 
        placeholder: "E, F" 
      },
    ],

    // ⚙️ QUAN TRỌNG: Map dữ liệu thành JSON cấu hình
    toPayload(form: any) {
      // Hàm tiện ích tách chuỗi "A, B" thành mảng ["A", "B"]
      const splitStr = (str: string) => 
        str ? str.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean) : [];

      return {
        name: form.name,
        cinemaId: form.theater, // ID Rạp
        cinemaType: form.cinemaType || "2D",
        
        // 👉 Tạo đúng cấu trúc JSON bạn yêu cầu
        seatLayout: {
          rows: splitStr(form.inputRows), // ["A", "B", "C"...]
          seatsPerRow: Number(form.seatsPerRow), // 10
          vipRows: splitStr(form.inputVip),      // ["C", "D"]
          coupleRows: splitStr(form.inputCouple) // ["E", "F"]
        }
      };
    },

    // Map ngược lại khi bấm Sửa (Edit)
    // 👉 SỬA ĐOẠN NÀY (Chiều về: API -> Form)
    toForm(item: any) {
      // 1. Map ID Rạp
      // Kiểm tra nếu cinemaId là object (do populate) thì lấy _id, nếu không thì lấy chính nó
      const theaterId = item.cinemaId && typeof item.cinemaId === 'object' 
        ? item.cinemaId._id 
        : item.cinemaId;

      // 2. Map Cấu hình ghế (seatConfig) ra các ô input
      // Nếu bản ghi có lưu seatConfig thì dùng nó, nếu không (data cũ) thì để trống
      const config = item.seatConfig || {};

      return {
        ...item,
        // Map lại ID rạp vào trường 'theater' của Form
        theater: theaterId,

        // Chuyển đổi Mảng -> Chuỗi (Ví dụ: ['A','B'] -> "A, B")
        inputRows: config.rows?.join(', ') || "",
        seatsPerRow: config.seatsPerRow || "",
        inputVip: config.vipRows?.join(', ') || "",
        inputCouple: config.coupleRows?.join(', ') || "",
      };
    }
  };

  return <CrudTable schema={schema as any} />;
}
