
// src/lib/seed.ts
import { seedIfEmpty } from "./mockCrud";

export function seedAll() {
  seedIfEmpty({
    movies: [
        { id: "m1", title: "Nhà Ma Xó", rating: "16", status: "now", poster: "https://picsum.photos/seed/ma1/600/900", desc: "Một ngôi nhà bị ám khiến người ở dần phát điên." },
        { id: "m2", title: "Cục Vàng Của Ngoại", rating: "P", status: "now", poster: "https://picsum.photos/seed/ma2/600/900", desc: "Hành trình cảm động của hai thế hệ." },
        { id: "m3", title: "Cái Mả", rating: "16", status: "now", poster: "https://picsum.photos/seed/ma3/600/900", desc: "Câu chuyện kinh dị đầy ám ảnh." },
        { id: "m4", title: "Trò Chơi Ares", rating: "13", status: "now", poster: "https://picsum.photos/seed/ma4/600/900", desc: "Thế giới ảo và hiện thực giao thoa." },
        { id: "m5", title: "Good Boy", rating: "13", status: "now", poster: "https://picsum.photos/seed/ma5/600/900", desc: "Chú chó trung thành và cuộc phiêu lưu bất ngờ." },
        { id: "m6", title: "Kẻ Truy Sát", rating: "18", status: "now", poster: "https://picsum.photos/seed/ma6/600/900", desc: "Truy đuổi nghẹt thở giữa bóng tối và ánh sáng." },
        { id: "m7", title: "Người Hùng Bóng Đêm", rating: "13", status: "now", poster: "https://picsum.photos/seed/ma7/600/900", desc: "Siêu anh hùng trở lại trong cuộc chiến mới." },
        { id: "m8", title: "Hẹn Hò Với Ma", rating: "P", status: "now", poster: "https://picsum.photos/seed/ma8/600/900", desc: "Câu chuyện tình yêu lãng mạn và kỳ bí." },
        { id: "m9", title: "Phỏng Vấn Sát Nhân", rating: "T18", status: "now", poster: "https://picsum.photos/seed/ma9/600/900", desc: "Một cuộc thẩm vấn gay cấn." },
         // --- SẮP CHIẾU ---
          { id: "m10", title: "Trò Chơi Ares 2", rating: "T13", status: "coming", poster: "https://picsum.photos/seed/ma10/600/900", desc: "Thế giới ảo và hiện thực giao thoa." },
          { id: "m11", title: "Hẹn Hò Với Ma 2", rating: "P", status: "coming", poster: "https://picsum.photos/seed/ma11/600/900", desc: "Câu chuyện tình yêu kỳ bí giữa người và hồn ma." },
          { id: "m12", title: "Kẻ Truy Sát 2", rating: "T18", status: "coming", poster: "https://picsum.photos/seed/ma12/600/900", desc: "Truy đuổi nghẹt thở giữa bóng tối và ánh sáng." },

          // --- PHIM IMAX ---
          { id: "m13", title: "Avatar: The Way of Water", rating: "T13", status: "imax", poster: "https://picsum.photos/seed/ma13/600/900", desc: "Thế giới Pandora trở lại đầy ngoạn mục." },
          { id: "m14", title: "Interstellar", rating: "T13", status: "imax", poster: "https://picsum.photos/seed/ma14/600/900", desc: "Hành trình xuyên vũ trụ và thời gian." },
        ],

    users: [
      { id: "u1", name: "Admin", email: "admin@onlycinema.vn", role: "admin", phone: "0900000000", status: "active" },
      { id: "u2", name: "Staff", email: "staff@onlycinema.vn", role: "staff", phone: "0900000001", status: "active" },
      { id: "u3", name: "User", email: "user@onlycinema.vn", role: "user", phone: "0900000002", status: "active" },
    ],
    promotions: [
      { id: "p1", title: "Mua 2 tặng 1", code: "M2T1", discount: 33, image: "https://picsum.photos/seed/promo1/600/300", desc: "Áp dụng cuối tuần" },
      { id: "p2", title: "Thứ 4 vui vẻ", code: "WED", discount: 20, image: "https://picsum.photos/seed/promo2/600/300", desc: "Giảm 20%" },
    ],
    theaters: [
      { id: "t1", name: "Only Cinema Quận 1", address: "123 Lê Lợi", city: "HCM" },
      { id: "t2", name: "Only Cinema Thủ Đức", address: "456 Phạm Văn Đồng", city: "HCM" },
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
      // Phim m1 - Nhà Ma Xó
      { id: "s1", movieId: "m1", theaterId: "t1", startTime: "2025-11-02T10:30", time: "10:30" },
      { id: "s2", movieId: "m1", theaterId: "t1", startTime: "2025-11-02T13:15", time: "13:15" },
      { id: "s3", movieId: "m1", theaterId: "t1", startTime: "2025-11-02T15:45", time: "15:45" },
      { id: "s4", movieId: "m1", theaterId: "t1", startTime: "2025-11-02T18:30", time: "18:30" },
      { id: "s5", movieId: "m1", theaterId: "t1", startTime: "2025-11-02T20:15", time: "20:15" },
      { id: "s6", movieId: "m1", theaterId: "t2", startTime: "2025-11-02T11:00", time: "11:00" },
      { id: "s7", movieId: "m1", theaterId: "t2", startTime: "2025-11-02T14:30", time: "14:30" },
      { id: "s8", movieId: "m1", theaterId: "t2", startTime: "2025-11-02T17:45", time: "17:45" },
      { id: "s9", movieId: "m1", theaterId: "t2", startTime: "2025-11-02T20:30", time: "20:30" },
      
      // Phim m2 - Cục Vàng Của Ngoại
      { id: "s10", movieId: "m2", theaterId: "t1", startTime: "2025-11-02T09:30", time: "09:30" },
      { id: "s11", movieId: "m2", theaterId: "t1", startTime: "2025-11-02T12:00", time: "12:00" },
      { id: "s12", movieId: "m2", theaterId: "t1", startTime: "2025-11-02T14:30", time: "14:30" },
      { id: "s13", movieId: "m2", theaterId: "t1", startTime: "2025-11-02T17:00", time: "17:00" },
      { id: "s14", movieId: "m2", theaterId: "t1", startTime: "2025-11-02T19:30", time: "19:30" },
      { id: "s15", movieId: "m2", theaterId: "t2", startTime: "2025-11-02T10:15", time: "10:15" },
      { id: "s16", movieId: "m2", theaterId: "t2", startTime: "2025-11-02T13:45", time: "13:45" },
      { id: "s17", movieId: "m2", theaterId: "t2", startTime: "2025-11-02T16:15", time: "16:15" },
      { id: "s18", movieId: "m2", theaterId: "t2", startTime: "2025-11-02T18:45", time: "18:45" },
      
      // Phim m3 - Cái Mả
      { id: "s19", movieId: "m3", theaterId: "t1", startTime: "2025-11-02T11:30", time: "11:30" },
      { id: "s20", movieId: "m3", theaterId: "t1", startTime: "2025-11-02T14:00", time: "14:00" },
      { id: "s21", movieId: "m3", theaterId: "t1", startTime: "2025-11-02T16:30", time: "16:30" },
      { id: "s22", movieId: "m3", theaterId: "t1", startTime: "2025-11-02T19:00", time: "19:00" },
      { id: "s23", movieId: "m3", theaterId: "t1", startTime: "2025-11-02T21:30", time: "21:30" },
      { id: "s24", movieId: "m3", theaterId: "t2", startTime: "2025-11-02T12:15", time: "12:15" },
      { id: "s25", movieId: "m3", theaterId: "t2", startTime: "2025-11-02T15:00", time: "15:00" },
      { id: "s26", movieId: "m3", theaterId: "t2", startTime: "2025-11-02T17:30", time: "17:30" },
      { id: "s27", movieId: "m3", theaterId: "t2", startTime: "2025-11-02T20:00", time: "20:00" },
    ],
    comments: [
      { id: "1", user: "User 1", content: "Phim hay quá!" },
  { id: "2", user: "User 2", content: "Cảm động thật sự." },
  { id: "3", user: "User 3", content: "Kịch bản hơi chán." },
  { id: "4", user: "User 4", content: "Diễn viên đẹp trai xinh gái." },
  { id: "5", user: "User 5", content: "Nhạc phim bắt tai." },
  { id: "6", user: "User 6", content: "Mình xem 2 lần rồi!" },
  { id: "7", user: "User 7", content: "Kết hơi đuối." },
  { id: "8", user: "User 8", content: "Phim rất đáng xem!" },
  { id: "9", user: "User 9", content: "Mong phần 2 sớm ra mắt!" },
  { id: "10", user: "User 10", content: "Tuyệt vời luôn!" },
    ],
    notifications: [
      { id: "n1", title: "Bảo trì hệ thống", message: "0h-2h sáng", target: "all" }
    ],
    tickets: [
      { id: "tk1", code: "A1B2C3", movie: "Avatar 2", seats: "A5,A6", status: "pending" },
      { id: "tk2", code: "D4E5F6", movie: "Tron Ares", seats: "B1,B2", status: "done" },
    ],
    
    combos: [
        { id: 'c1', name: 'Combo 1 - Bắp + Nước', price: 45000, desc: 'Bắp rang + Nước ngọt' },
        { id: 'c2', name: 'Combo 2 - 2 Bắp + 2 Nước', price: 80000, desc: 'Combo đôi' },
      ],
    orders: [
      { id: "o1", ticketId: "tk1", total: 230000, status: "pending" },
    ]
  });
}
