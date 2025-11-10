import React from "react";
import { Link, useParams } from "react-router-dom";
import { ThumbsUp, Share2 } from "lucide-react";
import { useCollection } from "../../../lib/mockCrud";
import SidebarMovieCard from "../../components/SidebarMovieCard";

type Director = {
  id: number;
  name: string;
  img: string;
  likes: number;
  bioShort: string;
  bioLong: string;
  birthday?: string;
  height?: string;
  country?: string;
  gallery: string[];
  films: { title: string; status?: string; img?: string }[];
};

const DIRECTORS: Record<string, Director> = {
  "1": {
    id: 1,
    name: "Christopher Nolan",
    img: "https://images.unsplash.com/photo-1526328828355-74b4497febe7?q=80&w=1200",
    likes: 7856,
    bioShort:
      "Nổi tiếng với phong cách dựng phim hack não cùng lối kể chuyện thu hút và phi tuyến tính, bản lĩnh kiên định đưa tên Christopher Nolan là nhà đạo diễn nổi tiếng hàng đầu hiện nay.",
    bioLong:
      "Sinh ngày 30/07/1970, Nolan sinh ra tại London và theo học ngành nghệ thuật trước khi bắt đầu sự nghiệp làm phim. Từ các tác phẩm độc lập đến những bom tấn Hollywood, Nolan đã chinh phục hàng triệu khán giả toàn cầu với các bộ phim như Memento (2000), The Dark Knight (2008), Inception (2010), Interstellar (2014) và Oppenheimer (2023). Hầu hết tác phẩm của ông đều mang đậm tính triết lý, cấu trúc thời gian phức tạp và âm nhạc điện ảnh ấn tượng.",
    birthday: "30/07/1970",
    height: "181 cm",
    country: "Anh",
    gallery: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200",
      "https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?q=80&w=1200",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200",
    ],
    films: [
      { title: "Inception", status: "Đang cập nhật" },
      { title: "The Odyssey", status: "Đang cập nhật" },
      { title: "Oppenheimer", status: "Đang cập nhật" },
      { title: "DUNKIRK / CUỘC DI TẢN DUNKIRK", status: "Đang cập nhật" },
      { title: "Tenet", status: "Đang cập nhật" },
    ],
  },
  "2": {
    id: 2,
    name: "Lê Bảo Trung",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200",
    likes: 33172,
    bioShort:
      "Tốt nghiệp xuất sắc khoa đạo diễn TRƯỜNG ĐẠI HỌC ĐIỆN ẢNH TP.HCM, đạo diễn Lê Bảo Trung ghi dấu với nhiều phim thương mại ăn khách.",
    bioLong:
      "Từ đầu thập niên 2000, Lê Bảo Trung hoạt động năng nổ ở điện ảnh Việt với các phim gia đình – hài hước. Anh từng là nhân viên bảo vệ 'xách tạ' trước khi rẽ sang nghiệp đạo diễn. Một số cột mốc: Giải Ngôi sao Điện ảnh (2000), Giải Liên hoan phim (2003), Ba Mùa (2003), Nhật ký tình yêu (2003), Giải Báo chí LHP toàn quốc (2004), Đề Mùi (2006). Gần đây anh tham gia các dự án như Bảo Mẫu Siêu Quậy 2, Lộc Phát, Anh Em Siêu Nhân.",
    birthday: "01/01/1974",
    height: "Đang cập nhật",
    country: "Việt Nam",
    gallery: [
      "https://images.unsplash.com/photo-1608889175123-8ee362201f23?q=80&w=1200",
      "https://images.unsplash.com/photo-1513491712393-7b57c86f2f12?q=80&w=1200",
      "https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?q=80&w=1200",
    ],
    films: [
      { title: "ĐẠI NÁO HỌC ĐƯỜNG", status: "Đang cập nhật" },
      { title: "LỘC PHÁT", status: "Đang cập nhật" },
      { title: "BẢO MẪU SIÊU QUẬY 2", status: "Đang cập nhật" },
      { title: "ANH EM SIÊU NHÂN", status: "Đang cập nhật" },
    ],
  },
  "3": {
    id: 3,
    name: "Đông Đăng Giao",
    img: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=1200",
    likes: 30812,
    bioShort:
      "Đạo diễn Việt Nam năng động với nhiều dự án giải trí đại chúng, phong cách kể chuyện gần gũi và dí dỏm.",
    bioLong:
      "Đông Đăng Giao khởi nghiệp từ lĩnh vực truyền hình – gameshow trước khi chuyển hướng sang điện ảnh. Anh tham gia nhiều dự án phim hài – gia đình, chú trọng nhịp kể dễ tiếp cận khán giả đại chúng. Bên cạnh vai trò đạo diễn, Giao còn tham gia chỉ đạo sản xuất cho các chương trình giải trí lớn.",
    birthday: "Đang cập nhật",
    height: "Đang cập nhật",
    country: "Việt Nam",
    gallery: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200",
    ],
    films: [
      { title: "Dự án A", status: "Đang cập nhật" },
      { title: "Dự án B", status: "Đang cập nhật" },
      { title: "Dự án C", status: "Đang cập nhật" },
    ],
  },
};

export default function DirectorDetail() {
  const { id } = useParams();
  const director = DIRECTORS[id || "1"];
  const { rows: movies = [] } = useCollection<any>("movies");

  const nowPlaying = movies
    .filter((m: any) => m.status === "now")
    .slice(0, 3)
    .map((m: any) => ({ id: m.id, name: m.title, img: m.poster, rating: m.rating || "7.3" }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Main content */}
      <div className="md:col-span-2">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-2">
          <Link to="/">Trang chủ</Link> <span className="mx-1">/</span> <Link to="/blog/directors">Đạo diễn</Link> <span className="mx-1">/</span> <span className="text-gray-900 font-medium">{director.name}</span>
        </div>

        {/* Header */}
        <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-4 items-start">
          <div className="w-full h-[280px] rounded-md overflow-hidden bg-gray-100">
            <img src={director.img} alt={director.name} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900">{director.name}</h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 bg-[#1877f2] text-white text-xs px-2 py-0.5 rounded">
                <ThumbsUp size={12} /> Thích
              </button>
              <button className="flex items-center gap-1 bg-[#e9ebf0] text-gray-700 text-xs px-2 py-0.5 rounded">
                <Share2 size={12} /> Chia sẻ
              </button>
              <span className="text-xs text-gray-600">👁 {director.likes}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{director.bioShort}</p>
            <div className="text-sm text-gray-700 space-y-1 mt-2">
              <div>Ngày sinh: <span className="font-medium">{director.birthday}</span></div>
              <div>Chiều cao: <span className="font-medium">{director.height}</span></div>
              <div>Quốc tịch: <span className="font-medium">{director.country}</span></div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <SectionTitle>HÌNH ẢNH</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {director.gallery.map((src, i) => (
            <div key={i} className="h-40 rounded-md overflow-hidden bg-gray-100">
              <img src={src} alt={`img-${i}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <SectionTitle>PHIM ĐÃ THAM GIA</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {director.films.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden">
                <img src={f.img || director.img} alt={f.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{f.title}</div>
                <div className="text-xs text-gray-500">{f.status || "Đang cập nhật"}</div>
              </div>
            </div>
          ))}
        </div>

        <SectionTitle>TIỂU SỬ</SectionTitle>
        <div className="prose prose-sm max-w-none text-gray-800">
          <p>{director.bioLong}</p>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">
        {/* Mua vé nhanh */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-blue-800 text-white text-center py-2 font-medium">Mua Vé Nhanh</div>
          <div className="p-3 space-y-3">
            <select className="w-full border rounded-md text-sm px-3 py-1.5"><option>Chọn phim</option></select>
            <select className="w-full border rounded-md text-sm px-3 py-1.5"><option>Chọn rạp</option></select>
            <select className="w-full border rounded-md text-sm px-3 py-1.5"><option>Chọn ngày</option></select>
            <button className="w-full bg-orange-500 text-white rounded-md py-1.5 text-sm hover:bg-orange-600">Mua Vé</button>
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3 mt-6">{children}</h2>
  );
}