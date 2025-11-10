import React from "react";
import { Link } from "react-router-dom";

const posts = [
  {
    id: 1,
    title: "Điều Gì Sẽ Xảy Ra Trong Predator: Badlands?",
    img: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?q=80&w=1200",
    views: 20,
  },
  {
    id: 2,
    title: "Top Phim Hay Dịp Cuối Năm 2025",
    img: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=600",
    views: 265,
  },
  {
    id: 3,
    title: "Final Destination Bloodlines: Hé Lộ Bí Mật Về Vòng Lặp Tử Thần",
    img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600",
    views: 196,
  },
  {
    id: 4,
    title: "Bùi Thạc Chuyên Và 11 Năm Tâm Huyết Với Địa Đạo: Mặt Trời Trong Bóng Tối",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600",
    views: 182,
  },
  {
    id: 5,
    title: "Avatar 3 Hé Lộ Thế Giới Dưới Biển Cực Kỳ Hoành Tráng",
    img: "https://images.unsplash.com/photo-1502139214982-d0ad755818d8?q=80&w=600",
    views: 489,
  },
  {
    id: 6,
    title: "Deadpool & Wolverine: Bộ Đôi Bất Bại Nhà Marvel",
    img: "https://images.unsplash.com/photo-1502139214982-d0ad755818d8?q=80&w=600",
    views: 922,
  },
];

export default function Blog() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">BLOG ĐIỆN ẢNH</h1>

      {/* Grid tất cả bài viết */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((p) => (
          <div
            key={p.id}
            className="rounded-xl overflow-hidden border hover:shadow-md transition"
          >
            <Link to={`/blogs/${p.id}`}>
              <img
                src={p.img}
                alt={p.title}
                className="w-full h-[220px] object-cover"
              />
            </Link>
            <div className="p-3">
              <Link to={`/blogs/${p.id}`}>
                <p className="font-medium text-sm mb-2 leading-snug hover:text-blue-600 cursor-pointer">
                  {p.title}
                </p>
              </Link>
              <div className="flex items-center text-xs text-gray-500 gap-3">
                <button className="bg-[#1877f2] text-white text-xs px-2 py-0.5 rounded">
                  👍 Thích
                </button>
                <span>👁 {p.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phần mô tả cuối trang */}
      <div className="mt-12 border-t pt-6 text-gray-700 text-sm leading-relaxed">
        <h2 className="font-semibold mb-2">BLOG ĐIỆN ẢNH CINEMA</h2>
        <p>
          Only Cinema mang đến cho bạn những bài viết phân tích, đánh giá, 
          và tin tức điện ảnh mới nhất trong nước và quốc tế. 
          Từ các bom tấn Hollywood đến điện ảnh Việt Nam, tất cả đều được chọn lọc và biên soạn kỹ lưỡng.
        </p>
        <p className="mt-2">
          Cùng theo dõi chuyên mục “Blog Điện Ảnh” để khám phá hậu trường làm phim, 
          phỏng vấn đạo diễn và diễn viên, cũng như những câu chuyện thú vị xoay quanh thế giới điện ảnh.
        </p>
      </div>
    </div>
  );
}
