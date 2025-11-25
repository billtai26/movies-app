
// src/types/entities.ts
// Schema definitions for admin CRUD rendering

export type FieldType = "text" | "number" | "select" | "datetime" | "textarea" | "image" | "boolean";

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[]; // for select
  placeholder?: string;
}

export interface EntitySchema {
  name: string;          // collection name
  title: string;         // human title
  columns: { key: string; label: string; width?: string }[];
  fields: FieldSchema[];
}

export const schemas: Record<string, EntitySchema> = {
  movies: {
    name: "movies", // Tên này sẽ được truyền vào api.create('movies', ...)
    title: "Phim",
    columns: [
      { key: "title", label: "Tiêu đề" },
      { key: "posterUrl", label: "Poster" }, // Backend thường trả về posterUrl sau khi upload
      { key: "status", label: "Trạng thái" },
    ],
    fields: [
      { key: "title", label: "Tiêu đề", type: "text", required: true },
      // Backend api.create tách key 'poster' ra để xử lý file
      { key: "poster", label: "Poster (File)", type: "image", required: false }, 
      // Kiểm tra model backend xem dùng key 'rating' hay 'ageRating'
      { key: "rating", label: "Phân loại (P)", type: "text" }, 
      // Option value phải khớp với enum trong database (ví dụ: 'now_showing', 'coming_soon')
      { key: "status", label: "Trạng thái", type: "select", options: [
        { label: "Đang chiếu", value: "now_showing" }, 
        { label: "Sắp chiếu", value: "coming_soon" },
        { label: "Ngưng chiếu", value: "ended" }
      ]},
      // Backend thường dùng 'description' thay vì 'desc'
      { key: "description", label: "Mô tả", type: "textarea" }, 
      
      // Bổ sung các trường cần thiết khác nếu Backend yêu cầu (ví dụ: thời lượng, ngày khởi chiếu)
      { key: "duration", label: "Thời lượng (phút)", type: "number" },
      { key: "releaseDate", label: "Ngày khởi chiếu", type: "datetime" },
    ]
  },
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
      { key: "role", label: "Vai trò", type: "select", options: [
        { label: "User", value: "user" }, { label: "Staff", value: "staff" }, { label: "Admin", value: "admin" }
      ]},
      { key: "phone", label: "SĐT", type: "text" },
      { key: "status", label: "Trạng thái", type: "select", options: [
        { label: "Hoạt động", value: "active" }, { label: "Khoá", value: "locked" }
      ]},
    ]
  },
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
    ]
  },
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
    ]
  },
  showtimes: {
    name: "showtimes",
    title: "Lịch chiếu",
    columns: [
      { key: "movieTitle", label: "Phim" },
      { key: "theaterName", label: "Rạp" },
      { key: "startTime", label: "Bắt đầu" },
    ],
    fields: [
      { key: "movieId", label: "Phim", type: "text", placeholder: "ID phim" },
      { key: "theaterId", label: "Rạp", type: "text", placeholder: "ID rạp" },
      { key: "startTime", label: "Bắt đầu", type: "datetime" },
      { key: "room", label: "Phòng", type: "text" },
    ]
  },
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
      { key: "status", label: "Trạng thái", type: "select", options: [
        { label: "Hiển thị", value: "shown" }, { label: "Ẩn", value: "hidden" }
      ]},
    ]
  },
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
      { key: "target", label: "Đối tượng", type: "select", options: [
        { label: "Tất cả", value: "all" }, { label: "User", value: "user" }, { label: "Staff", value: "staff" }
      ]},
    ]
  },
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
      { key: "status", label: "Trạng thái", type: "select", options: [
        { label: "Đang chờ", value: "pending" }, { label: "Đã xem", value: "done" }, { label: "Huỷ", value: "cancel" }
      ]},
    ]
  },
};
