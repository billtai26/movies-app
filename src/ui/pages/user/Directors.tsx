import React from "react";
import { Link } from "react-router-dom";
import { ThumbsUp } from "lucide-react";
import SidebarMovieCard from "../../components/SidebarMovieCard";
import Dropdown from "../../components/Dropdown";
import QuickBooking from "../../components/QuickBooking";
import { useCollection } from "../../../lib/mockCrud";

export default function Directors() {
  const { rows: movies = [] } = useCollection<any>("movies");

  const directors = [
    {
      id: 1,
      name: "Christopher Nolan",
      bio: "Đạo diễn xuất sắc với phong cách kể chuyện phi tuyến và các tác phẩm đình đám như Inception, Interstellar, Oppenheimer.",
      img: "https://images.unsplash.com/photo-1526328828355-74b4497febe7?q=80&w=1200",
      likes: 1240,
    },
    {
      id: 2,
      name: "Lê Bảo Trung",
      bio: "Đạo diễn Việt Nam với nhiều phim thương mại ăn khách như Bảo Mẫu Siêu Quậy, Lộc Phát, Anh Em Siêu Nhân.",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200",
      likes: 33172,
    },
    {
      id: 3,
      name: "Đông Đăng Giao",
      bio: "Đạo diễn năng động, gắn với các dự án giải trí đại chúng, phong cách kể chuyện gần gũi.",
      img: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=1200",
      likes: 30812,
    },
  ];

  const nowPlaying = movies
    .filter((m: any) => m.status === "now")
    .slice(0, 3)
    .map((m: any) => ({ id: m.id, name: m.title, img: m.poster, rating: m.rating || "7.5" }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Cột trái */}
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold border-l-4 border-blue-600 pl-2 mb-4">
          ĐẠO DIỄN
        </h2>

        {/* Bộ lọc: theo mẫu Reviews */}
        <Filters />

        {/* Danh sách đạo diễn */}
        <div className="space-y-6">
          {directors.map((d) => (
            <div key={d.id} className="flex flex-col md:flex-row items-start gap-4 border-b border-gray-200 pb-6">
              <Link to={`/blog/directors/${d.id}`} className="shrink-0">
                <div className="w-full h-44 md:w-[220px] md:h-[140px] rounded-md overflow-hidden bg-gray-100">
                  <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                </div>
              </Link>
              <div className="flex-1">
                <Link to={`/blog/directors/${d.id}`}>
                  <h3 className="font-semibold text-base text-gray-800 hover:text-blue-600 cursor-pointer">
                    {d.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-3 text-xs mt-1">
                  <button className="flex items-center gap-1 bg-[#1877f2] text-white text-xs px-2 py-0.5 rounded">
                    <ThumbsUp size={12} /> Thích
                  </button>
                  <span>👁 {d.likes}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {d.bio}
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
          <div className="bg-orange-500 text-white text-center py-2 font-medium">Mua Vé Nhanh</div>
          <div className="p-3">
            <QuickBooking stacked className="shadow-none border-none" />
          </div>
        </div>

        {/* Phim đang chiếu */}
        <div>
          <h3 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3">PHIM ĐANG CHIẾU</h3>
          <div className="space-y-3">
            {nowPlaying.map((p) => (
              <SidebarMovieCard key={p.id} movie={p} />
            ))}
          </div>
          <Link to="/movies" className="block mx-auto mt-4 w-fit border border-orange-500 text-orange-500 px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition">
            Xem thêm →
          </Link>
        </div>
      </aside>
    </div>
  );
}

function Filters() {
  const [country, setCountry] = React.useState("all");
  const [sort, setSort] = React.useState("most_viewed");

  return (
    <div className="mb-6">
      <div className="flex gap-3">
        <Dropdown
          value={country}
          onChange={setCountry}
          options={[
            { label: "Quốc Gia", value: "all" },
            { label: "Việt Nam", value: "vn" },
            { label: "Mỹ", value: "us" },
            { label: "Anh", value: "uk" },
            { label: "Pháp", value: "fr" },
            { label: "Đức", value: "de" },
            { label: "Ý", value: "it" },
            { label: "Tây Ban Nha", value: "es" },
            { label: "Bồ Đào Nha", value: "pt" },
            { label: "Brazil", value: "br" },
            { label: "Canada", value: "ca" },
            { label: "Argentina", value: "ar" },
            { label: "Bỉ", value: "be" },
            { label: "Đan Mạch", value: "dk" },
            { label: "Hà Lan", value: "nl" },
            { label: "Na Uy", value: "no" },
            { label: "Thụy Điển", value: "se" },
            { label: "Thổ Nhĩ Kỳ", value: "tr" },
            { label: "Nga", value: "ru" },
            { label: "Trung Quốc", value: "cn" },
            { label: "Nhật Bản", value: "jp" },
            { label: "Hàn Quốc", value: "kr" },
            { label: "Hong Kong", value: "hk" },
            { label: "Đài Loan", value: "tw" },
            { label: "Thái Lan", value: "th" },
            { label: "Indonesia", value: "id" },
            { label: "Campuchia", value: "kh" },
            { label: "Myanmar", value: "mm" },
            { label: "Nepal", value: "np" },
            { label: "Malaysia", value: "my" },
            { label: "Philippines", value: "ph" },
            { label: "Singapore", value: "sg" },
            { label: "New Zealand", value: "nz" },
            { label: "Ireland", value: "ie" },
          ]}
          minWidth={220}
        />
        <Dropdown
          value={sort}
          onChange={setSort}
          options={[
            { label: "Xem Nhiều Nhất", value: "most_viewed" },
            { label: "Mới nhất", value: "newest" },
            { label: "Đánh giá tốt nhất", value: "best_rated" },
          ]}
          minWidth={180}
        />
      </div>
      <div className="h-[2px] bg-blue-600 mt-3" />
    </div>
  );
}