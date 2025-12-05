import React from "react";
import { Link, useParams } from "react-router-dom";
import { ThumbsUp, Share2 } from "lucide-react";
import { api } from "../../../lib/api";
import SidebarMovieCard from "../../components/SidebarMovieCard";
import QuickBooking from "../../components/QuickBooking";

type Actor = {
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

const ACTORS: Record<string, Actor> = {
  "1": {
    id: 1,
    name: "Chris Evans",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200",
    likes: 139998,
    bioShort:
      "Khác với Chris Hemsworth điển trai loay hoay trong vai thần sấm sét, Chris Evans là một chàng trai gần gũi và ấm áp trong người hùng Captain America.",
    bioLong:
      "Chris Evans được biết đến rộng rãi qua vai Captain America trong Vũ trụ Điện ảnh Marvel. Ngoài đời, anh theo đuổi các dự án độc lập và kịch nghệ, đồng thời tham gia các hoạt động cộng đồng. Với phong cách diễn xuất ấm áp và gần gũi, Evans chiếm được cảm tình của đông đảo khán giả.",
    birthday: "13/06/1981",
    height: "183 cm",
    country: "Mỹ",
    gallery: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200",
      "https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?q=80&w=1200",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200",
    ],
    films: [
      { title: "Captain America: The First Avenger", status: "Đang cập nhật" },
      { title: "Avengers: Endgame", status: "Đang cập nhật" },
      { title: "Knives Out", status: "Đang cập nhật" },
    ],
  },
  "2": {
    id: 2,
    name: "Margot Robbie",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200",
    likes: 129312,
    bioShort:
      "Dĩ nhiên, cô nàng sắc chẳng bao giờ là đủ để đảm bảo cho chức vị thần công lý hoặc nữ hoàng điện ảnh! Margot Robbie còn phải có giọng nói và cách diễn xuất đi vào lòng người.",
    bioLong:
      "Margot Robbie nổi bật với khả năng biến hóa qua nhiều vai diễn, từ Harley Quinn đến Barbie. Cô là một trong những diễn viên sáng giá của thập kỷ với nhiều đề cử và giải thưởng danh giá.",
    birthday: "02/07/1990",
    height: "168 cm",
    country: "Úc",
    gallery: [
      "https://images.unsplash.com/photo-1513491712393-7b57c86f2f12?q=80&w=1200",
      "https://images.unsplash.com/photo-1608889175123-8ee362201f23?q=80&w=1200",
      "https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?q=80&w=1200",
    ],
    films: [
      { title: "Barbie", status: "Đang cập nhật" },
      { title: "The Wolf of Wall Street", status: "Đang cập nhật" },
    ],
  },
  "3": {
    id: 3,
    name: "Charlize Theron",
    img: "https://images.unsplash.com/photo-1525134477261-c00061e3d2d3?q=80&w=1200",
    likes: 110534,
    bioShort:
      "Bắt đầu từ vai diễn táo bạo, Charlize Theron trở thành ngôi sao hạng A với các dự án chất lượng ở Hollywood.",
    bioLong:
      "Charlize Theron là nữ diễn viên – nhà sản xuất người Nam Phi, từng đoạt Oscar. Cô nổi tiếng với khả năng hóa thân mạnh mẽ và các dự án hành động – tâm lý.",
    birthday: "07/08/1975",
    height: "177 cm",
    country: "Nam Phi",
    gallery: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
    ],
    films: [
      { title: "Mad Max: Fury Road", status: "Đang cập nhật" },
      { title: "Atomic Blonde", status: "Đang cập nhật" },
    ],
  },
  "4": {
    id: 4,
    name: "Hugh Jackman",
    img: "https://images.unsplash.com/photo-1545996124-1b6c3b1b7c5f?q=80&w=1200",
    likes: 98640,
    bioShort:
      "Tài tử đa năng của Hollywood, gắn liền hình ảnh Wolverine và nhiều vai diễn sân khấu – điện ảnh ấn tượng.",
    bioLong:
      "Hugh Jackman vừa là diễn viên điện ảnh vừa là nghệ sĩ sân khấu xuất sắc, sở hữu giọng hát và năng lượng cuốn hút.",
    birthday: "12/10/1968",
    height: "190 cm",
    country: "Úc",
    gallery: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200",
      "https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?q=80&w=1200",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200",
    ],
    films: [
      { title: "Logan", status: "Đang cập nhật" },
      { title: "The Greatest Showman", status: "Đang cập nhật" },
    ],
  },
};

export default function ActorDetail() {
  const { id } = useParams();
  const actor = ACTORS[id || "1"];
  const [nowPlaying, setNowPlaying] = React.useState<any[]>([])
  React.useEffect(()=>{
    api.listMovies({ status: 'now_showing', limit: 4 })
      .then((res:any)=>{
        const list = res?.movies || res || []
        const mapped = (Array.isArray(list) ? list : []).map((m:any)=> ({ id: m._id || m.id, name: m.title || m.name, img: (m as any).posterUrl || m.poster, rating: (m as any).averageRating ?? m.rating }))
        setNowPlaying(mapped.slice(0,3))
      })
      .catch(()=> setNowPlaying([]))
  },[])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Main content */}
      <div className="md:col-span-2">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-2">
          <Link to="/">Trang chủ</Link> <span className="mx-1">/</span> <Link to="/blog/actors">Diễn viên</Link> <span className="mx-1">/</span> <span className="text-gray-900 font-medium">{actor.name}</span>
        </div>

        {/* Header */}
        <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-4 items-start">
          <div className="w-full h-[280px] rounded-md overflow-hidden bg-gray-100">
            <img src={actor.img} alt={actor.name} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900">{actor.name}</h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 bg-[#1877f2] text-white text-xs px-2 py-0.5 rounded">
                <ThumbsUp size={12} /> Thích
              </button>
              <button className="flex items-center gap-1 bg-[#e9ebf0] text-gray-700 text-xs px-2 py-0.5 rounded">
                <Share2 size={12} /> Chia sẻ
              </button>
              <span className="text-xs text-gray-600">👁 {actor.likes}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{actor.bioShort}</p>
            <div className="text-sm text-gray-700 space-y-1 mt-2">
              <div>Ngày sinh: <span className="font-medium">{actor.birthday}</span></div>
              <div>Chiều cao: <span className="font-medium">{actor.height}</span></div>
              <div>Quốc tịch: <span className="font-medium">{actor.country}</span></div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <SectionTitle>HÌNH ẢNH</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {actor.gallery.map((src, i) => (
            <div key={i} className="h-40 rounded-md overflow-hidden bg-gray-100">
              <img src={src} alt={`img-${i}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <SectionTitle>PHIM ĐÃ THAM GIA</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {actor.films.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden">
                <img src={f.img || actor.img} alt={f.title} className="w-full h-full object-cover" />
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
          <p>{actor.bioLong}</p>
        </div>
      </div>

      {/* Sidebar */}
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3 mt-6">{children}</h2>
  );
}
