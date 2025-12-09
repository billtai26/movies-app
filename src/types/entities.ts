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
  // --- THÊM 2 DÒNG NÀY ---
  disabled?: boolean;        // Luôn luôn khóa (nếu cần)
  readonlyOnEdit?: boolean;  // Chỉ khóa khi đang Sửa (Edit)
  // -----------------------
}

export interface EntitySchema {
  name: string;          // collection name
  title: string;         // human title
  columns: { key: string; label: string; width?: string }[];
  fields: FieldSchema[];
  transformRow?: (row: any) => any; // Hàm biến đổi dữ liệu trước khi hiển thị lên bảng
  toForm?: (row: any) => any;       // Hàm biến đổi dữ liệu trước khi đưa vào form Sửa
  toPayload?: (row: any) => any;    // Hàm biến đổi dữ liệu trước khi gửi lên API
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
      { key: "username", label: "Username" },
      { key: "email", label: "Email" },
      { key: "role", label: "Vai trò" },
    ],
    fields: [
      { key: "username", label: "Username", type: "text", required: true },
      { 
        key: "email", 
        label: "Email", 
        type: "text", 
        required: true, 
        disabled: true // Email vẫn nên khóa
      },
      { 
        key: "password", 
        label: "Mật khẩu", 
        type: "text", 
        // Đổi thành false để khi Sửa không bắt buộc nhập
        required: false, 
        // Bỏ dòng readonlyOnEdit: true đi để cho phép sửa
        placeholder: "Nhập mật khẩu" 
      },
      { key: "role", label: "Vai trò", type: "select", options: [
        { label: "Người dùng", value: "user" }, 
        { label: "Nhân viên", value: "staff" }, 
        { label: "Quản trị viên", value: "admin" }
      ]},
      // Thêm các trường khác nếu Backend cho phép sửa
      { key: "phone", label: "Số điện thoại", type: "text" },
      { key: "loyaltyPoints", label: "Điểm tích lũy", type: "text" }
    ]
  },
  promotions: {
    name: "vouchers", // Endpoint BE
    title: "Khuyến mãi",
    
    // Cập nhật cột hiển thị cho dễ nhìn hơn
    columns: [
      { key: "code", label: "Mã Voucher" },
      { key: "discountType", label: "Loại" },
      { key: "discountValue", label: "Giá trị" },
      { key: "usageLimit", label: "SL" },       // Hiển thị số lượng
      { key: "expiresAt", label: "Hết hạn" },   // Hiển thị ngày hết hạn
    ],

    fields: [
      // 1. Mã Voucher
      { key: "code", label: "Mã (VD: SALE10)", type: "text", required: true },
      
      // 2. Loại giảm giá & Giá trị
      { 
        key: "discountType", 
        label: "Loại giảm giá", 
        type: "select", 
        required: true,
        options: [
            { label: "Theo phần trăm (%)", value: "percent" },
            { label: "Tiền mặt (VND)", value: "fixed" } // Nếu BE hỗ trợ fixed
        ]
      },
      { key: "discountValue", label: "Giá trị giảm (VD: 10 hoặc 50000)", type: "text", required: true },

      // --- CÁC TRƯỜNG MỚI BẠN CẦN THÊM ---
      
      // 3. Giảm tối đa (thường dùng cho % - VD: Giảm 10% tối đa 50k)
      { key: "maxDiscountAmount", label: "Giảm tối đa (VND)", type: "number", placeholder: "VD: 50000" },
      
      // 4. Đơn tối thiểu để áp dụng
      { key: "minOrderAmount", label: "Đơn hàng tối thiểu (VND)", type: "number", placeholder: "VD: 100000", required: true },
      
      // 5. Giới hạn số lượng
      { key: "usageLimit", label: "Tổng số lượng phát hành", type: "number", placeholder: "VD: 100", required: true },
      
      // 6. Thời gian hết hạn
      { key: "expiresAt", label: "Thời gian hết hạn", type: "datetime", required: true },

      // Nếu BE không cần title/desc/image thì bạn có thể comment lại hoặc để đó nếu muốn lưu thêm
      { key: "title", label: "Tiêu đề hiển thị (Optional)", type: "text" },
      { key: "desc", label: "Mô tả (Optional)", type: "textarea" },
    ],
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
    
    // 1. Thêm hàm transformRow để lấy username từ object user
    transformRow: (row: any) => ({
      ...row,
      // Lấy username từ user.username HOẶC row.username, nếu không có thì để 'Ẩn danh'
      author: row?.user?.username || row?.username || "Người dùng ẩn danh"
    }),

    // 2. Thêm hàm toForm để khi bấm Sửa cũng hiện tên người dùng
    toForm: (row: any) => ({
      ...row,
      author: row?.user?.username || row?.username || "Người dùng ẩn danh"
    }),

    columns: [
      { key: "author", label: "Người dùng" }, 
      { key: "content", label: "Nội dung" },
      { key: "status", label: "Trạng thái" }, // Nên hiển thị thêm cột trạng thái
    ],
    fields: [
      { 
        key: "author", 
        label: "Người dùng", 
        type: "text", 
        required: true,
        disabled: true // Khóa trường này lại vì không nên sửa tác giả bình luận
      },
      { 
        key: "content", 
        label: "Nội dung", 
        type: "textarea", 
        required: true, 
        disabled: true 
      },
      { 
        key: "movieId", 
        label: "ID Phim", 
        type: "text", 
        disabled: true 
      }, // Nên khóa ID phim
      { 
        key: "status", 
        label: "Trạng thái (Ẩn/Hiện)", // <--- ĐÂY LÀ TRƯỜNG DUY NHẤT SỬA ĐƯỢC
        type: "select", 
        required: true,
        options: [
          { label: "Hiển thị", value: "shown" }, 
          { label: "Ẩn (Vi phạm)", value: "hidden" }
        ]
      },
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
  },
  combos: {
    name: "combos",
    title: "Combo Bắp Nước",
    columns: [
      { key: "name", label: "Tên Combo" },
      { key: "price", label: "Giá" },
      // Sửa key cột hiển thị nếu cần
      { key: "imageUrl", label: "Ảnh" }, 
    ],
    fields: [
      { key: "name", label: "Tên Combo", type: "text", required: true },
      { key: "price", label: "Giá", type: "number", required: true },
      
      // 1. Sửa 'items' thành 'description'
      { key: "description", label: "Chi tiết (VD: 2 Bắp + 1 Nước)", type: "textarea", required: true },
      
      // 2. Sửa 'image' thành 'imageUrl'
      { key: "imageUrl", label: "Ảnh URL", type: "text", required: true }, 
    ]
  },
};
