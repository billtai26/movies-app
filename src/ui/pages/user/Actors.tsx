import React from "react";
import { Link } from "react-router-dom";
import { ThumbsUp } from "lucide-react";
import Dropdown from "../../components/Dropdown";
import SidebarMovieCard from "../../components/SidebarMovieCard";
import { useCollection } from "../../../lib/mockCrud";

export default function Actors() {
  const { rows: movies = [] } = useCollection<any>("movies");

  const actors = [
    {
      id: 1,
      name: "Chris Evans",
      desc:
        "Khác với Chris Hemsworth điển trai loay hoay trong vai thần sấm sét, Chris Evans là một chàng trai gần gũi và ấm áp trong người hùng Captain America.",
      img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200",
      likes: 139998,
    },
    {
      id: 2,
      name: "Margot Robbie",
      desc:
        "Dĩ nhiên, cô nàng sắc chẳng bao giờ là đủ để đảm bảo cho chức vị thần công lý hoặc nữ hoàng điện ảnh! Margot Robbie còn phải có giọng nói và cách diễn xuất đi vào lòng người.",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200",
      likes: 129312,
    },
    {
      id: 3,
      name: "Charlize Theron",
      desc:
        "Bất đầu tư vào những dự án độc đáo của điện ảnh Hollywood, cô xuất hiện ở bộ phim hạng B nhưng toả sáng rực rỡ ở những vai diễn khí chất.",
      img: "https://images.unsplash.com/photo-1525134477261-c00061e3d2d3?q=80&w=1200",
      likes: 110534,
    },
    {
      id: 4,
      name: "Hugh Jackman",
      desc:
        "Tài tử đa năng của Hollywood, gắn liền hình ảnh Wolverine và nhiều vai diễn sân khấu – điện ảnh ấn tượng.",
      img: "https://images.unsplash.com/photo-1545996124-1b6c3b1b7c5f?q=80&w=1200",
      likes: 98640,
    },
  ];

  const nowPlaying = movies
    .filter((m: any) => m.status === "now")
    .slice(0, 3)
    .map((m: any) => ({ id: m.id, name: m.title, img: m.poster, rating: m.rating || "7.4" }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left column */}
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold border-l-4 border-blue-600 pl-2 mb-4">DIỄN VIÊN</h2>

        <Filters />

        <div className="space-y-6">
          {actors.map((a) => (
            <div key={a.id} className="flex flex-col md:flex-row items-start gap-4 border-b border-gray-200 pb-6">
              <Link to={`/blog/actors/${a.id}`} className="shrink-0">
                <div className="w-full h-44 md:w-[220px] md:h-[140px] rounded-md overflow-hidden bg-gray-100">
                  <img src={a.img} alt={a.name} className="w-full h-full object-cover" />
                </div>
              </Link>
              <div className="flex-1">
                <Link to={`/blog/actors/${a.id}`}>
                  <h3 className="font-semibold text-base text-gray-800 hover:text-blue-600 cursor-pointer">
                    {a.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-3 text-xs mt-1">
                  <button className="flex items-center gap-1 bg-[#1877f2] text-white text-xs px-2 py-0.5 rounded">
                    <ThumbsUp size={12} /> Thích
                  </button>
                  <span>👁 {a.likes}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right column */}
      <aside className="space-y-6">
        {/* Quick buy */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-blue-800 text-white text-center py-2 font-medium">Mua Vé Nhanh</div>
          <div className="p-3 space-y-3">
            <select className="w-full border rounded-md text-sm px-3 py-1.5"><option>Chọn phim</option></select>
            <select className="w-full border rounded-md text-sm px-3 py-1.5"><option>Chọn rạp</option></select>
            <select className="w-full border rounded-md text-sm px-3 py-1.5"><option>Chọn ngày</option></select>
            <button className="w-full bg-orange-500 text-white rounded-md py-1.5 text-sm hover:bg-orange-600">Mua Vé</button>
          </div>
        </div>

        {/* Now playing */}
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
            { label: "Hàn Quốc", value: "kr" },
            { label: "Nhật Bản", value: "jp" },
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