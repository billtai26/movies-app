// src/ui/pages/admin/Tickets.tsx
import React, { useEffect, useState } from "react";
import CrudTable from "../../components/CrudTable";
import { api } from "../../../lib/api";

export default function AdminTickets() {
  const [users, setUsers] = useState<any[]>([]);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]); // 1. Thêm state lưu danh sách phim

  // 🟢 Load User, Showtime và Movies
  useEffect(() => {
    (async () => {
      try {
        // Thêm params { limit: 1000 } để lấy nhiều dữ liệu nhất có thể
        // Lưu ý: Đây là giải pháp frontend, tốt nhất vẫn là BE populate
        const [uData, sData, mData] = await Promise.all([
            api.list("users", { limit: 1000 }),     // <--- THÊM LIMIT
            api.list("showtimes", { limit: 1000 }), // <--- THÊM LIMIT
            api.list("movies", { limit: 1000 })     // <--- THÊM LIMIT
        ]);

        const safeArray = (data: any) => {
            if (Array.isArray(data)) return data;
            // Kiểm tra các trường hợp trả về có phân trang
            if (data?.data && Array.isArray(data.data)) return data.data; 
            if (data?.users && Array.isArray(data.users)) return data.users;
            if (data?.showtimes && Array.isArray(data.showtimes)) return data.showtimes;
            if (data?.movies && Array.isArray(data.movies)) return data.movies;
            // Trường hợp backend trả về { results: [...] }
            if (data?.results && Array.isArray(data.results)) return data.results;
            return [];
        };

        setUsers(safeArray(uData));
        setShowtimes(safeArray(sData));
        setMovies(safeArray(mData));
        
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
      }
    })();
  }, []);

  const schema = {
    name: "tickets",
    title: "Vé / Hóa đơn",

    // Fix lỗi hiển thị ghế [object Object] khi nhấn Sửa
    toForm: (data: any) => {
      const clone = { ...data };
      if (Array.isArray(clone.seats)) {
        clone.seats = clone.seats.map((s: any) => `${s.row}${s.number}`).join(",");
      }
      return clone;
    },

    columns: [
      { key: "_id", label: "Mã vé" },
      { 
        key: "userId", 
        label: "Người đặt",
        render: (row: any) => {
            // 1. ƯU TIÊN: Nếu userId là Object (đã populate từ BE) -> Lấy username
            if (row.userId && typeof row.userId === 'object') {
                return row.userId.username || row.userId.email || "Khách ẩn danh";
            }

            // 2. DỰ PHÒNG: Nếu userId là String -> Tìm trong danh sách users đã tải về
            if (typeof row.userId === 'string') {
              const user = users.find(u => u._id === row.userId);
              if (user) return user.username || user.email || "Khách ẩn danh";
            }

            // 3. Cuối cùng: Trả về giá trị mặc định
            return "Khách ẩn danh";
        }
      },
      {
          key: "showtimeId",
          label: "Phim",
          render: (row: any) => {
              let foundShowtime = null;

              // Trường hợp 1: row.showtimeId là Object (BE đã populate)
              if (row.showtimeId && typeof row.showtimeId === 'object') {
                  foundShowtime = row.showtimeId;
              } 
              // Trường hợp 2: row.showtimeId là String ID -> Tìm trong state showtimes
              else if (typeof row.showtimeId === 'string') {
                  foundShowtime = showtimes.find(s => s._id === row.showtimeId);
              }

              if (!foundShowtime) return "---";

              // Sau khi có showtime, ta tìm Movie
              // Movie có thể nằm trực tiếp trong showtime (nếu showtime đã populate movie)
              if (foundShowtime.movieId && typeof foundShowtime.movieId === 'object') {
                  return foundShowtime.movieId.title || "Tên phim ẩn";
              }
              
              // Hoặc movie chỉ là ID -> Tìm trong state movies
              if (typeof foundShowtime.movieId === 'string') {
                const foundMovie = movies.find(m => m._id === foundShowtime.movieId);
                return foundMovie ? foundMovie.title : "Phim không tồn tại";
              }

              return "---";
          }
      },
      { 
        key: "seats", 
        label: "Ghế",
        render: (row: any) => {
          // Xử lý ghế: Nếu là mảng object ghế -> map ra tên ghế
          if (Array.isArray(row.seats)) {
            // Kiểm tra xem phần tử con là object hay string
            return row.seats.map((s: any) => {
                if (typeof s === 'object') return `${s.row}${s.number}`;
                return s; 
            }).join(", ");
          }
          return row.seats || "";
        }
      },
      { key: "paymentStatus", label: "Thanh toán" },
      { 
          key: "totalAmount", 
          label: "Tổng tiền",
          render: (row: any) => Number(row.totalAmount).toLocaleString('vi-VN') + ' ₫'
      },
    ],
    fields: [
      {
        key: "userId",
        label: "Người đặt",
        type: "select",
        required: true,
        options: (Array.isArray(users) ? users : []).map((u) => ({ 
            label: u.name || u.email || "Unknown", 
            value: u._id 
        })),
      },
      {
        key: "showtimeId",
        label: "Lịch chiếu",
        type: "select",
        required: true,
        // 3. Map showtimes kết hợp với movies để ra label đúng
        options: (Array.isArray(showtimes) ? showtimes : []).map((s) => {
            // Tìm movie tương ứng
            const movie = movies.find(m => m._id === s.movieId); // s.movieId là liên kết
            const movieName = movie ? movie.title : (s.movieTitle || "Phim chưa rõ");
            
            // Format ngày chiếu
            const time = new Date(s.startTime).toLocaleString("vi-VN", {
                hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit"
            });

            return {
                label: `${movieName} - ${time}`,
                value: s._id,
            };
        }),
      },
      { 
          key: "seats", 
          label: "Ghế (Chỉ xem)", 
          type: "text", 
          required: true,
          readonlyOnEdit: true 
      },
      { key: "totalAmount", label: "Tổng tiền (₫)", type: "number", required: true },
      {
        key: "bookingStatus",
        label: "Trạng thái Đặt",
        type: "select",
        required: true,
        options: [
          { label: "Đã đặt (Active)", value: "active" },
          { label: "Đã hủy (Cancelled)", value: "cancelled" },
        ],
      },
      {
        key: "paymentStatus",
        label: "Trạng thái Thanh toán",
        type: "select",
        required: true,
        options: [
            { label: "Chờ thanh toán", value: "pending" },
            { label: "Đã thanh toán", value: "completed" },
            { label: "Thất bại", value: "failed" },
        ]
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
