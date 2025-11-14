// src/types/entities.ts

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "datetime"
  | "textarea"
  | "image"
  | "boolean";

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface EntitySchema {
  name: string;
  title: string;
  columns: { key: string; label: string; width?: string }[];
  fields: FieldSchema[];
}

export const schemas: Record<string, EntitySchema> = {
  // 🎬 PHIM
      movies: {
      name: "movies",
      title: "Phim",
      columns: [
        { key: "title", label: "Tiêu đề" },
        { key: "duration", label: "Thời lượng" },
        { key: "genre", label: "Thể loại" },
      ],
      fields: [
        { key: "title", label: "Tiêu đề", type: "text", required: true },
        { key: "poster", label: "Poster (URL)", type: "image" },
        { key: "description", label: "Mô tả", type: "textarea" },
        { key: "duration", label: "Thời lượng (phút)", type: "number" },
        { key: "genre", label: "Thể loại (phân cách bằng dấu phẩy)", type: "text" },
      ],
    },


  // 🎭 THỂ LOẠI
  genres: {
    name: "genres",
    title: "Thể loại",
    columns: [{ key: "name", label: "Tên thể loại" }],
    fields: [
      {
        key: "name",
        label: "Tên thể loại",
        type: "text",
        required: true,
      },
    ],
  },

  // 🏢 RẠP
  theaters: {
    name: "theaters",
    title: "Rạp",
    columns: [
      { key: "name", label: "Tên rạp" },
      { key: "address", label: "Địa chỉ" },
    ],
    fields: [
      { key: "name", label: "Tên rạp", type: "text", required: true },
      { key: "address", label: "Địa chỉ", type: "text", required: true },
    ],
  },

  // 🕒 LỊCH CHIẾU
  showtimes: {
    name: "showtimes",
    title: "Lịch chiếu",
    columns: [
      { key: "movieTitle", label: "Phim" },
      { key: "theaterName", label: "Rạp" },
      { key: "startTime", label: "Bắt đầu" },
    ],
    fields: [
      {
        key: "movieId",
        label: "Phim (ID)",
        type: "text",
        required: true,
      },
      {
        key: "theaterId",
        label: "Rạp (ID)",
        type: "text",
        required: true,
      },
      {
        key: "startTime",
        label: "Thời gian bắt đầu",
        type: "datetime",
        required: true,
      },
      {
        key: "basePrice",
        label: "Giá thường",
        type: "number",
        required: true,
      },
      {
        key: "vipPrice",
        label: "Giá VIP",
        type: "number",
        required: true,
      },
    ],
  },

  // 💺 PHÒNG & GHẾ
  roomsseats: {
    name: "roomsseats",
    title: "Phòng & Ghế",
    columns: [
      { key: "roomName", label: "Phòng" },
      { key: "theaterId", label: "Rạp (ID)" },
      { key: "seats", label: "Số ghế" },
    ],
    fields: [
      { key: "roomName", label: "Tên phòng", type: "text", required: true },
      { key: "theaterId", label: "Rạp (ID)", type: "text", required: true },
      {
        key: "seats",
        label: "Ghế (A1,A2,B1...)",
        type: "text",
        placeholder: "Nhập danh sách ghế, phân cách bằng dấu phẩy",
      },
    ],
  },

  // 🍿 COMBOS
  combos: {
    name: "combos",
    title: "Combo",
    columns: [
      { key: "name", label: "Tên combo" },
      { key: "price", label: "Giá" },
    ],
    fields: [
      { key: "name", label: "Tên combo", type: "text", required: true },
      { key: "price", label: "Giá", type: "number", required: true },
      {
        key: "items",
        label: "Gồm (phân cách bằng dấu phẩy)",
        type: "text",
      },
    ],
  },

  // 🎟 VÉ
  tickets: {
  name: "tickets",
  title: "Vé / Hóa đơn",

  // --- Cột bảng ---
  columns: [
    { key: "invoiceCode", label: "Mã vé" },
    { key: "user", label: "User ID" },
    { key: "showtime", label: "Showtime ID" },
    { key: "status", label: "Trạng thái" },
  ],

  // --- Field trong Form CRUD ---
  fields: [
    { key: "invoiceCode", label: "Mã vé", type: "text", required: true },

    { key: "user", label: "User ID", type: "text", required: true },

    { key: "showtime", label: "Showtime ID", type: "text", required: true },

    {
      key: "seats",
      label: "Ghế",
      type: "text",
      placeholder: "A1, A2, B3",
      required: true,
    },

    {
      key: "totalPrice",
      label: "Tổng tiền",
      type: "number",
      required: true,
    },

    {
      key: "paymentMethod",
      label: "Thanh toán",
      type: "select",
      options: [
        { value: "cash", label: "Tiền mặt" },
        { value: "momo", label: "Momo" },
        { value: "zalo", label: "ZaloPay" },
        { value: "vnpay", label: "VNPAY" },
      ],
      required: true,
    },

    {
      key: "status",
      label: "Trạng thái",
      type: "select",
      options: [
        { value: "booked", label: "Đã đặt" },
        { value: "paid", label: "Đã thanh toán" },
        { value: "canceled", label: "Đã hủy" },
      ],
      required: true,
    },
  ],
},
  // 💬 BÌNH LUẬN
  comments: {
    name: "comments",
    title: "Bình luận",
    columns: [
      { key: "user", label: "User ID" },
      { key: "movie", label: "Movie ID" },
      { key: "content", label: "Nội dung" },
    ],
    fields: [
      { key: "user", label: "User ID", type: "text", required: true },
      { key: "movie", label: "Movie ID", type: "text", required: true },
      { key: "content", label: "Nội dung", type: "textarea", required: true },
      { key: "rating", label: "Đánh giá (1–5)", type: "number" },
    ],
  },

  // 🔔 THÔNG BÁO
  notifications: {
    name: "notifications",
    title: "Thông báo",
    columns: [
      { key: "title", label: "Tiêu đề" },
      { key: "type", label: "Loại" },
    ],
    fields: [
      { key: "title", label: "Tiêu đề", type: "text", required: true },
      { key: "content", label: "Nội dung", type: "textarea", required: true },
      {
        key: "type",
        label: "Loại",
        type: "select",
        options: [
          { label: "Hệ thống", value: "system" },
          { label: "Khuyến mãi", value: "promotion" },
          { label: "Nhắc nhở", value: "reminder" },
        ],
      },
    ],
  },

  // 💸 VOUCHERS
  vouchers: {
    name: "vouchers",
    title: "Khuyến mãi",
    columns: [
      { key: "code", label: "Mã" },
      { key: "discountPercent", label: "Giảm (%)" },
      { key: "validTo", label: "Hết hạn" },
    ],
    fields: [
      { key: "code", label: "Mã", type: "text", required: true },
      { key: "description", label: "Mô tả", type: "textarea" },
      {
        key: "discountPercent",
        label: "Giảm (%)",
        type: "number",
        required: true,
      },
      {
        key: "validFrom",
        label: "Bắt đầu",
        type: "datetime",
        required: true,
      },
      {
        key: "validTo",
        label: "Kết thúc",
        type: "datetime",
        required: true,
      },
      { key: "isActive", label: "Kích hoạt", type: "boolean" },
    ],
  },
};
