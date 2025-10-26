
// src/lib/seed.ts
import { seedIfEmpty } from "./mockCrud";

export function seedAll() {
  seedIfEmpty({
    movies: [
      { id: "m1", title: "Avatar: The Way of Water", rating: "13", status: "now", poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", desc: "Pandora trở lại" },
      { id: "m2", title: "Tron: Ares", rating: "16", status: "coming", poster: "https://image.tmdb.org/t/p/w500/eoK7my1iJ8C8f5DJKV93cbvXQeH.jpg", desc: "Kỷ nguyên số" },
    ],
    users: [
      { id: "u1", name: "Admin", email: "admin@cinesta.vn", role: "admin", phone: "0900000000", status: "active" },
      { id: "u2", name: "Staff", email: "staff@cinesta.vn", role: "staff", phone: "0900000001", status: "active" },
      { id: "u3", name: "User", email: "user@cinesta.vn", role: "user", phone: "0900000002", status: "active" },
    ],
    promotions: [
      { id: "p1", title: "Mua 2 tặng 1", code: "M2T1", discount: 33, image: "https://picsum.photos/seed/promo1/600/300", desc: "Áp dụng cuối tuần" },
      { id: "p2", title: "Thứ 4 vui vẻ", code: "WED", discount: 20, image: "https://picsum.photos/seed/promo2/600/300", desc: "Giảm 20%" },
    ],
    theaters: [
      { id: "t1", name: "Cinesta Quận 1", address: "123 Lê Lợi", city: "HCM" },
      { id: "t2", name: "Cinesta Thủ Đức", address: "456 Phạm Văn Đồng", city: "HCM" },
    ],
          genres: [
        { id: 'g1', name: 'Hành động' },
        { id: 'g2', name: 'Tình cảm' },
        { id: 'g3', name: 'Kinh dị' },
      ],
      rooms: [
        { id: 'r1', name: 'Room A' },
        { id: 'r2', name: 'Room B' },
      ],
    showtimes: [
      { id: "s1", movieId: "m1", movieTitle: "Avatar 2", theaterId: "t1", theaterName: "Q1", startTime: "2025-10-27T19:30" },
      { id: "s2", movieId: "m2", movieTitle: "Tron Ares", theaterId: "t2", theaterName: "TD", startTime: "2025-11-01T20:00" },
    ],
    comments: [
      { id: "c1", author: "User", content: "Phim hay!", movieId: "m1", status: "shown" }
    ],
    notifications: [
      { id: "n1", title: "Bảo trì hệ thống", message: "0h-2h sáng", target: "all" }
    ],
    tickets: [
      { id: "tk1", code: "A1B2C3", movie: "Avatar 2", seats: "A5,A6", status: "pending" },
      { id: "tk2", code: "D4E5F6", movie: "Tron Ares", seats: "B1,B2", status: "done" },
    ],
    combos: [
        { id: 'c1', name: 'Combo VIP - Bắp + Nước', price: 45000, desc: 'Bắp rang + Nước ngọt', imageUrl: 'https://images.unsplash.com/photo-1582719478171-2cf4e1b1d43b' },
        { id: 'c2', name: 'Combo Family - Burger + Snack + Drink', price: 80000, desc: 'Combo gia đình', imageUrl: 'https://images.unsplash.com/photo-1606755962773-0e31a6f83f4d' },
      ],
    orders: [
      { id: "o1", ticketId: "tk1", total: 230000, status: "pending" },
    ]
  });
}
