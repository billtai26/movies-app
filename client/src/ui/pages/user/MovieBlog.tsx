import React from "react";
import { ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function MovieBlog() {
  const blogs = [
    {
      id: 1,
      title: "Điều Gì Sẽ Xảy Ra Trong Predator: Badlands?",
      desc: "Phim mới nhất thuộc series Predator chính thức quay trở lại màn ảnh rộng với tên gọi Predator: Badlands.",
      img: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?q=80&w=1200",
      views: 20,
    },
    {
      id: 2,
      title: "Top Phim Hay Dịp Cuối Năm 2025",
      desc: "Những tác phẩm xuất sắc của điện ảnh Việt Nam và điện ảnh thế giới sẽ ra mắt vào dịp cuối năm 2025. Stars chờ đợi phim nào nhất?",
      img: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1200",
      views: 265,
    },
    {
      id: 3,
      title: "Final Destination Bloodlines: Hé Lộ Bí Mật Về Vòng Lặp Tử Thần",
      desc: "Final Destination: Bloodlines hé lộ bí ẩn chớp nhoáng về cái bẫy chết chóc của Tử Thần.",
      img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200",
      views: 196,
    },
  ];

  const nowPlaying = [
    {
      id: 1,
      name: "Phá Đám: Sinh Nhật Mẹ",
      img: "https://picsum.photos/300/200?random=10",
      rating: "8.2",
    },
    {
      id: 2,
      name: "Nhà Ma Xó",
      img: "https://picsum.photos/300/200?random=11",
      rating: "7.0",
    },
    {
      id: 3,
      name: "Cục Vàng Của Ngoại",
      img: "https://picsum.photos/300/200?random=12",
      rating: "8.4",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Cột trái */}
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold border-l-4 border-blue-600 pl-2 mb-4">
          BLOG ĐIỆN ẢNH
        </h2>

        <div className="space-y-6">
          {blogs.map((b) => (
            <div key={b.id} className="flex flex-col md:flex-row border-b border-gray-200 pb-4">
              <img
                src={b.img}
                alt={b.title}
                className="w-full md:w-56 h-40 object-cover rounded-md mb-3 md:mb-0 md:mr-4"
              />
              <div>
                <h3 className="font-semibold text-base text-gray-800 hover:text-blue-600 cursor-pointer">
                  {b.title}
                </h3>
                <div className="flex items-center gap-3 text-xs mt-1">
                  <button className="flex items-center gap-1 bg-[#1877f2] text-white text-xs px-2 py-0.5 rounded">
                    <ThumbsUp size={12} /> Thích
                  </button>
                  <span>👁 {b.views}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cột phải */}
      <aside className="space-y-6">
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-blue-800 text-white text-center py-2 font-medium">
            Mua Vé Nhanh
          </div>
          <div className="p-3 space-y-3">
            <select className="w-full border rounded-md text-sm px-3 py-1.5">
              <option>Chọn phim</option>
            </select>
            <select className="w-full border rounded-md text-sm px-3 py-1.5">
              <option>Chọn rạp</option>
            </select>
            <select className="w-full border rounded-md text-sm px-3 py-1.5">
              <option>Chọn ngày</option>
            </select>
            <button className="w-full bg-orange-500 text-white rounded-md py-1.5 text-sm hover:bg-orange-600">
              Mua Vé
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3">
            PHIM ĐANG CHIẾU
          </h3>
          <div className="space-y-3">
            {nowPlaying.map((p) => (
              <div key={p.id}>
                <img
                  src={p.img}
                  alt={p.name}
                  className="rounded-lg w-full h-44 object-cover"
                />
                <p className="mt-1 text-sm text-gray-700">{p.name}</p>
              </div>
            ))}
          </div>

          <Link
            to="/movies"
            className="block mx-auto mt-4 w-fit border border-orange-500 text-orange-500 px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition"
          >
            Xem thêm →
          </Link>
        </div>
      </aside>
    </div>
  );
}
