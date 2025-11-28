
// src/types/entities.ts
// Schema definitions for admin CRUD rendering

// 1. Thêm 'layout' vào FieldType
export type FieldType = "text" | "number" | "select" | "datetime" | "textarea" | "image" | "boolean" | "layout";

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
    name: "movies",
    title: "Phim",
    columns: [
      { key: "title", label: "Tiêu đề" },
      { key: "posterUrl", label: "Poster" },
      { key: "status", label: "Trạng thái" },
    ],
    fields: [
      { key: "title", label: "Tiêu đề", type: "text", required: true },
      { key: "description", label: "Mô tả", type: "textarea", required: true },
      
      // --- CÁC TRƯỜNG MỚI/SỬA ---
      { key: "director", label: "Đạo diễn", type: "text", required: true }, // Thêm mới
      { key: "actors", label: "Diễn viên", type: "text" }, // (Optional: nếu Backend cần thì thêm)
      
      // Sửa key 'duration' thành 'durationInMinutes'
      { key: "durationInMinutes", label: "Thời lượng (phút)", type: "number", required: true },
      
      { key: "releaseDate", label: "Ngày khởi chiếu", type: "datetime", required: true },
      
      // Thêm mới: Nhập chuỗi, BackendApi sẽ tách thành mảng
      { key: "genres", label: "Thể loại (cách nhau dấu phẩy)", type: "text", required: true, placeholder: "Hành động, Hài hước" },
      
      { key: "trailerUrl", label: "Trailer URL", type: "text", required: true }, // Thêm mới
      
      // Giữ nguyên Poster Url
      { key: "posterUrl", label: "Poster URL", type: "text", required: true }, 

      // XÓA key 'rating' đi vì Backend báo "not allowed"
      // { key: "rating", ... } -> Xóa
      
      { key: "status", label: "Trạng thái", type: "select", options: [
        { label: "Đang chiếu", value: "now_showing" }, 
        { label: "Sắp chiếu", value: "coming_soon" }
        // Lưu ý: Joi validation chỉ cho phép 'now_showing' hoặc 'coming_soon'. 
        // Nếu chọn 'ended' sẽ bị lỗi validation, trừ khi sửa Backend.
      ]},
    ]
  },
  // --- THÊM ĐOẠN NÀY VÀO ---
  genres: {
    name: "genres", // Tên collection trong database/API
    title: "Thể loại phim",
    columns: [
      { key: "name", label: "Tên thể loại" },
      { key: "slug", label: "Slug" }, // Thường backend sẽ tự tạo slug, nhưng hiển thị ra để xem
    ],
    fields: [
      { key: "name", label: "Tên thể loại", type: "text", required: true, placeholder: "Ví dụ: Hành động, Kinh dị..." },
      // Nếu backend yêu cầu nhập slug thủ công thì mở dòng dưới, nếu tự động thì thôi
      // { key: "slug", label: "Slug", type: "text" }, 
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
    name: "cinemas",
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
  // 2. Thêm schema cinemaHalls (Phòng chiếu)
  cinemaHalls: {
    name: "cinemaHalls", // Tên này phải khớp với mapping trong backendApi
    title: "Phòng chiếu",
    columns: [
      { key: "name", label: "Tên phòng" }, // BE thường trả về 'name'
      { key: "theater", label: "Rạp" },    // Cần populate tên rạp
      { key: "seatCount", label: "Số ghế" },
    ],
    fields: [
       // Các field sẽ được override trong component để lấy options động
      { key: "name", label: "Tên phòng", type: "text", required: true },
    ]
  }
};
