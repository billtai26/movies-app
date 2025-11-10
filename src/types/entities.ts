// src/types/entities.ts
// Schema definitions for admin CRUD rendering

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
  options?: { label: string; value: string }[]; // for select
  placeholder?: string;
}

export interface EntitySchema {
  name: string; // collection name
  title: string; // human title
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
      { key: "rating", label: "P" },
      { key: "status", label: "Trạng thái" },
    ],
    fields: [
      { key: "title", label: "Tiêu đề", type: "text", required: true },
      { key: "poster", label: "Poster (URL)", type: "image", required: true },
      { key: "rating", label: "Phân loại (P)", type: "text" },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: [
          { label: "Đang chiếu", value: "now" },
          { label: "Sắp chiếu", value: "coming" },
        ],
      },
      { key: "desc", label: "Mô tả", type: "textarea" },
    ],
  },

  // 👤 NGƯỜI DÙNG
  users: {
    name: "users",
    title: "Người dùng",
    columns: [
      { key: "name", label: "Họ tên" },
      { key: "email", label: "Email" },
      { key: "role", label: "Vai trò" },
    ],
    fields: [
      { key: "name", label: "Họ tên", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true },
      {
        key: "role",
        label: "Vai trò",
        type: "select",
        options: [
          { label: "User", value: "user" },
          { label: "Staff", value: "staff" },
          { label: "Admin", value: "admin" },
        ],
      },
      { key: "phone", label: "SĐT", type: "text" },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: [
          { label: "Hoạt động", value: "active" },
          { label: "Khoá", value: "locked" },
        ],
      },
    ],
  },

  // 💸 KHUYẾN MÃI
  promotions: {
    name: "promotions",
    title: "Khuyến mãi",
    columns: [
      { key: "title", label: "Tiêu đề" },
      { key: "code", label: "Mã" },
      { key: "discount", label: "Giảm (%)" },
    ],
    fields: [
      { key: "title", label: "Tiêu đề", type: "text", required: true },
      { key: "image", label: "Ảnh (URL)", type: "image" },
      { key: "code", label: "Mã", type: "text" },
      { key: "discount", label: "Giảm (%)", type: "number" },
      { key: "desc", label: "Mô tả", type: "textarea" },
    ],
  },

  // 🏢 RẠP
  theaters: {
    name: "theaters",
    title: "Rạp/Cụm",
    columns: [
      { key: "name", label: "Tên cụm rạp" },
      { key: "address", label: "Địa chỉ" },
      { key: "city", label: "Thành phố" },
    ],
    fields: [
      { key: "name", label: "Tên", type: "text", required: true },
      { key: "address", label: "Địa chỉ", type: "text" },
      { key: "city", label: "Thành phố", type: "text" },
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
      { key: "endTime", label: "Kết thúc" },
    ],
    fields: [
      { key: "movie", label: "Phim (ID hoặc tên)", type: "text" },
      { key: "theater", label: "Rạp", type: "text" },
      { key: "roomName", label: "Phòng", type: "text" },
      { key: "startTime", label: "Bắt đầu", type: "datetime" },
      { key: "endTime", label: "Kết thúc", type: "datetime" },
    ],
  },

  // 💬 BÌNH LUẬN
  comments: {
    name: "comments",
    title: "Bình luận",
    columns: [
      { key: "author", label: "Người dùng" },
      { key: "content", label: "Nội dung" },
    ],
    fields: [
      { key: "author", label: "Người dùng", type: "text", required: true },
      { key: "content", label: "Nội dung", type: "textarea", required: true },
      { key: "movieId", label: "ID Phim", type: "text" },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: [
          { label: "Hiển thị", value: "shown" },
          { label: "Ẩn", value: "hidden" },
        ],
      },
    ],
  },

  // 🔔 THÔNG BÁO
  notifications: {
    name: "notifications",
    title: "Thông báo",
    columns: [
      { key: "title", label: "Tiêu đề" },
      { key: "target", label: "Đối tượng" },
    ],
    fields: [
      { key: "title", label: "Tiêu đề", type: "text", required: true },
      { key: "message", label: "Nội dung", type: "textarea", required: true },
      {
        key: "target",
        label: "Đối tượng",
        type: "select",
        options: [
          { label: "Tất cả", value: "all" },
          { label: "User", value: "user" },
          { label: "Staff", value: "staff" },
        ],
      },
    ],
  },

  // 🎟️ VÉ
  tickets: {
    name: "tickets",
    title: "Vé/Hóa đơn",
    columns: [
      { key: "code", label: "Mã vé" },
      { key: "movie", label: "Phim" },
      { key: "status", label: "Trạng thái" },
    ],
    fields: [
      { key: "code", label: "Mã vé", type: "text", required: true },
      { key: "movie", label: "Phim", type: "text" },
      { key: "seats", label: "Ghế", type: "text" },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: [
          { label: "Đang chờ", value: "pending" },
          { label: "Đã xem", value: "done" },
          { label: "Huỷ", value: "cancel" },
        ],
      },
    ],
  },

  // 💺 PHÒNG & GHẾ
  "rooms-seats": {
  name: "rooms-seats",
  title: "Phòng & Ghế",
  columns: [
    { key: "roomName", label: "Phòng" },
    { key: "theaterName", label: "Rạp/Cụm" },
    { key: "seatCount", label: "Số ghế" },
  ],
  fields: [
    { key: "roomName", label: "Tên phòng", type: "text", required: true },
    {
      key: "theater",
      label: "Rạp/Cụm",
      type: "text", // hoặc select nếu bạn có list rạp
      required: true,
      placeholder: "Nhập ID hoặc chọn rạp",
    },
    { key: "seatCount", label: "Số ghế", type: "number", required: true },
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
  ],
}
};
