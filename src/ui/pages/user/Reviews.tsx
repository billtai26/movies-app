import React from "react";
import { ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function Reviews() {
  const reviews = [
    {
      id: 1,
      title:
        "[Review] Cục Vàng Của Ngoại: Việt Hương – Hồng Đào Lấy Nước Mắt Khán Giả",
      desc: "Sau thành công trăm tỷ của phim hay Chị Dâu, đạo diễn Khương Ngọc tiếp tục phát huy thế mạnh ở dòng phim tâm lý gia đình với Cục Vàng Của Ngoại. Âm là đồng biên kịch cùng nhà văn Nguyễn Ngọc Thạch.",
      img: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1000",
      likes: 457,
    },
    {
      id: 2,
      title: "[Review] Tron Ares: Mãn Nhãn Với Công Nghệ Vượt Thời Đại",
      desc: "Tron: Ares mang đến bữa tiệc thị giác đỉnh cao cho khán giả yêu phim hành động – viễn tưởng.",
      img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000",
      likes: 352,
    },
    {
      id: 3,
      title:
        "[Review] Từ Chiến Trên Không: Phim Việt Xuất Sắc Top Đầu 2025!",
      desc: "Với Từ Chiến Trên Không xuất sắc, điện ảnh Việt Nam có thể mở ra một kỷ nguyên phim hành động đẳng cấp Hollywood.",
      img: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1000",
      likes: 2616,
    },
  ];

  const nowPlaying = [
    {
      id: 1,
      name: "Nhà Ma Xó",
      img: "https://picsum.photos/300/200?random=10",
      rating: "7.0",
    },
    {
      id: 2,
      name: "Cục Vàng Của Ngoại",
      img: "https://picsum.photos/300/200?random=11",
      rating: "8.4",
    },
    {
      id: 3,
      name: "Tee Yod: Quỷ Ăn Tạng 3",
      img: "https://picsum.photos/300/200?random=12",
      rating: "7.5",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Cột trái */}
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold border-l-4 border-blue-600 pl-2 mb-4">
          BÌNH LUẬN PHIM
        </h2>

        {/* Bộ lọc */}
        <div className="flex gap-3 mb-6">
          <select className="border border-gray-300 text-sm rounded-md px-3 py-1.5 focus:ring-1 focus:ring-blue-500">
            <option>Tất Cả</option>
          </select>
          <select className="border border-gray-300 text-sm rounded-md px-3 py-1.5 focus:ring-1 focus:ring-blue-500">
            <option>Đang Chiếu/ Sắp Chiếu</option>
          </select>
          <select className="border border-gray-300 text-sm rounded-md px-3 py-1.5 focus:ring-1 focus:ring-blue-500">
            <option>Mới Nhất</option>
          </select>
        </div>

        {/* Danh sách bài review */}
        <div className="space-y-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-col md:flex-row border-b border-gray-200 pb-4"
            >
              <img
                src={r.img}
                alt={r.title}
                className="w-full md:w-52 h-40 object-cover rounded-md mb-3 md:mb-0 md:mr-4"
              />
              <div>
                <h3 className="font-semibold text-base text-gray-800 hover:text-blue-600 cursor-pointer">
                  {r.title}
                </h3>
                <div className="flex items-center gap-3 text-xs mt-1">
                  <button className="flex items-center gap-1 bg-[#1877f2] text-white text-xs px-2 py-0.5 rounded">
                    <ThumbsUp size={12} /> Thích
                  </button>
                  <span>👁 {r.likes}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {r.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cột phải */}
      <aside className="space-y-6">
        {/* Mua vé nhanh */}
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

        {/* Phim đang chiếu */}
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

          {/* Nút xem thêm */}
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
