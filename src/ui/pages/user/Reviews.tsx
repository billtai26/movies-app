import React from "react";
import { ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import SidebarMovieCard from "../../components/SidebarMovieCard";
import Dropdown from "../../components/Dropdown";
import QuickBooking from "../../components/QuickBooking";

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

        {/* Bộ lọc: dropdown theo mẫu */}
        <Filters />

        {/* Danh sách bài review */}
        <div className="space-y-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-col md:flex-row items-start gap-4 border-b border-gray-200 pb-6"
            >
              <Link to={`/reviews/${r.id}`}>
                <div className="w-full h-44 md:w-[220px] md:h-[140px] rounded-md overflow-hidden">
                  <img
                    src={r.img}
                    alt={r.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <div className="flex-1">
                <Link to={`/reviews/${r.id}`}>
                  <h3 className="font-semibold text-base text-gray-800 hover:text-blue-600 cursor-pointer">
                    {r.title}
                  </h3>
                </Link>
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
        {/* Mua vé nhanh theo mẫu */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-orange-500 text-white text-center py-2 font-medium">
            Mua Vé Nhanh
          </div>
          <div className="p-3">
            <QuickBooking stacked className="shadow-none border-none" />
          </div>
        </div>

        {/* Phim đang chiếu */}
        <div>
          <h3 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3">
            PHIM ĐANG CHIẾU
          </h3>
          <div className="space-y-3">
            {nowPlaying.map((p) => (
              <SidebarMovieCard key={p.id} movie={p} />
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

function Filters() {
  const [type, setType] = React.useState("all");
  const [status, setStatus] = React.useState("soon");
  const [sort, setSort] = React.useState("top");

  return (
    <div className="flex gap-3 mb-6">
      <Dropdown
        value={type}
        onChange={setType}
        options={[
          { label: "Tất cả", value: "all" },
          { label: "Review", value: "review" },
          { label: "Preview", value: "preview" },
        ]}
        minWidth={150}
      />
      <Dropdown
        value={status}
        onChange={setStatus}
        options={[
          { label: "Đang chiếu/ Sắp chiếu", value: "all" },
          { label: "Đang chiếu", value: "now" },
          { label: "Sắp chiếu", value: "soon" },
        ]}
        minWidth={170}
      />
      <Dropdown
        value={sort}
        onChange={setSort}
        options={[
          { label: "Xem nhiều nhất", value: "views" },
          { label: "Mới nhất", value: "new" },
          { label: "Đánh giá tốt nhất", value: "top" },
        ]}
        minWidth={160}
      />
    </div>
  );
}
