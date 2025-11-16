import React from "react";
import { ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useCollection } from "../../../lib/mockCrud";
import SidebarMovieCard from "../../components/SidebarMovieCard";
import QuickBooking from "../../components/QuickBooking";

export default function MovieBlog() {
  const { rows: movies = [] } = useCollection<any>("movies");
  
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

  // Lấy 3 phim đang chiếu từ dữ liệu thực
  const nowPlaying = movies
    .filter(m => m.status === 'now')
    .slice(0, 3)
    .map(m => ({
      id: m.id,
      name: m.title,
      img: m.poster || "https://picsum.photos/300/200?random=10",
      rating: m.rating || "8.0",
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Cột trái */}
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold border-l-4 border-blue-600 pl-2 mb-4">
          BLOG ĐIỆN ẢNH
        </h2>

        <div className="space-y-6">
          {blogs.map((b) => (
            <div key={b.id} className="flex flex-col md:flex-row border-b border-gray-200 pb-4 gap-4">
              <Link to={`/blogs/${b.id}`} className="md:mr-0 shrink-0">
                {/* Fixed-size container to keep thumbnails perfectly uniform */}
                <div className="w-full md:w-56 h-40 rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={b.img}
                    alt={b.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <div>
                <Link to={`/blogs/${b.id}`}>
                  <h3 className="font-semibold text-base text-gray-800 hover:text-blue-600 cursor-pointer leading-snug line-clamp-2">
                    {b.title}
                  </h3>
                </Link>
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
          <div className="bg-orange-500 text-white text-center py-2 font-medium">
            Mua Vé Nhanh
          </div>
          <div className="p-3">
            <QuickBooking stacked className="shadow-none border-none" />
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3">
            PHIM ĐANG CHIẾU
          </h3>
          <div className="space-y-3">
            {nowPlaying.map((p) => (
              <SidebarMovieCard key={p.id} movie={p} />
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
