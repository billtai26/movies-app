
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/mockApi'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const Banner: React.FC = () => {
  const banners = [
    'https://picsum.photos/1200/400?random=11',
    'https://picsum.photos/1200/400?random=12',
    'https://picsum.photos/1200/400?random=13',
    'https://picsum.photos/1200/400?random=14'
  ]
  const settings = { dots:true, infinite:true, autoplay:true, autoplaySpeed:3000, speed:600, easing:'ease-in-out', arrows:false, slidesToShow:1, slidesToScroll:1 }
  return (
    <div className="overflow-hidden rounded-2xl shadow-sm">
      <Slider {...settings}>
        {banners.map((b,i)=>(<img key={i} src={b} className="h-56 w-full object-cover md:h-80" />))}
      </Slider>
    </div>
  )
}

function QuickBuy(){
  const nav = useNavigate()
  const [movies, setMovies] = React.useState<any[]>([])
  const [theaters, setTheaters] = React.useState<any[]>([])
  const [showtimes, setShowtimes] = React.useState<any[]>([])
  const [movie, setMovie] = React.useState(''); const [theater, setTheater] = React.useState(''); const [showtime, setShowtime] = React.useState('')
  React.useEffect(()=>{ api.listMovies('now').then(setMovies); api.listTheaters().then(setTheaters); api.listShowtimes().then(setShowtimes) },[])
  const filtered = showtimes.filter(s => (!movie || s.movieId===movie) && (!theater || s.theaterId===theater))
  return (
    <div className="mx-auto -mt-6 max-w-7xl rounded-2xl border bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="grid items-end gap-3 md:grid-cols-5">
        <div>
          <div className="label">1. Chọn phim</div>
          <select className="input" value={movie} onChange={e=>{ setMovie(e.target.value); setShowtime('') }}>
            <option value="">-- Tất cả --</option>
            {movies.map(m=> <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
        <div>
          <div className="label">2. Chọn rạp</div>
          <select className="input" value={theater} onChange={e=>{ setTheater(e.target.value); setShowtime('') }}>
            <option value="">-- Tất cả --</option>
            {theaters.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <div className="label">3. Chọn suất</div>
          <select className="input" value={showtime} onChange={e=>setShowtime(e.target.value)}>
            <option value="">-- Chọn suất --</option>
            {filtered.map(st=> <option key={st.id} value={st.id}>{new Date(st.startTime).toLocaleString()}</option>)}
          </select>
        </div>
        <button disabled={!showtime} className="btn-primary disabled:opacity-50" onClick={()=> nav(`/booking/seats/${showtime}`)}>Mua vé nhanh</button>
      </div>
    </div>
  )
}

function MovieRow({ title, data }:{ title:string, data:any[] }){
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-bold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data.map(m => (
          <Link key={m.id} to={`/movies/${m.id}`} className="group relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
            <img src={m.poster} className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
              <div className="font-semibold">{m.title}</div>
              <button className="mt-2 hidden rounded-xl px-3 py-1 text-xs font-medium text-white group-hover:inline-block" style={{background:'var(--brand)'}}>Mua vé</button>
            </div>
            <div className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">P{m.rating}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function Promos(){ const [items,setItems]=React.useState<any[]>([]); React.useEffect(()=>{ api.listPromos().then(setItems)},[]); return (
  <section className="mt-8">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-xl font-bold">Tin khuyến mãi</h2>
      <Link to="/offers" className="text-sm" style={{color:'var(--brand)'}}>Xem thêm →</Link>
    </div>
    <div className="grid gap-4 md:grid-cols-3">{items.slice(0,3).map(p=>(
      <div key={p.id} className="card">
        <img src={p.image} className="mb-2 rounded-xl"/><div className="font-semibold">{p.title}</div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{p.desc}</p>
      </div>
    ))}</div>
  </section>)}

function Articles() {
  const [activeTab, setActiveTab] = React.useState("review");

  const featured = {
    title: "[Review] Tron Ares: Mãn Nhãn Với Công Nghệ Vượt Thời Đại",
    image: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    likes: 195,
  };

  const sideArticles = [
    {
      title: "[Review] Tử Chiến Trên Không: Phim Việt Xuất Sắc Top Đầu 2025!",
      image: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      likes: 2442,
    },
    {
      title:
        "[Review] The Conjuring Last Rites: Chương Cuối Trọn Vẹn Cảm Xúc",
      image: "https://image.tmdb.org/t/p/w500/hlK0e0wAQ3VLuJcsfIYPvb4JVud.jpg",
      likes: 566,
    },
    {
      title:
        "[Preview] The Conjuring Last Rites: Chương Cuối Cùng Ám Ảnh Ra Sao?",
      image: "https://image.tmdb.org/t/p/w500/hlK0e0wAQ3VLuJcsfIYPvb4JVud.jpg",
      likes: 1111,
    },
  ];

  const blogs = [
    {
      title: "[Blog] Hậu Trường Kung Fu Panda 4: Hành Trình Của Po",
      image: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    },
    {
      title: "[Blog] Top 5 Bom Tấn IMAX Không Thể Bỏ Lỡ 2025",
      image: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    },
    {
      title: "[Blog] Bí Ẩn Tron Ares Và Tương Lai Thế Giới Ảo",
      image: "https://image.tmdb.org/t/p/w500/eoK7my1iJ8C8f5DJKV93cbvXQeH.jpg",
    },
  ];

  const data = activeTab === "review" ? { featured, sideArticles } : { featured: blogs[0], sideArticles: blogs.slice(1) };

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="border-l-4 border-sky-500 pl-2 uppercase tracking-wide">
            Góc điện ảnh
          </span>
        </h2>
        <div className="flex gap-6 text-sm font-medium">
          <button
            className={`pb-1 border-b-2 transition ${
              activeTab === "review"
                ? "border-sky-500 text-sky-400"
                : "border-transparent hover:text-sky-300"
            }`}
            onClick={() => setActiveTab("review")}
          >
            Bình luận phim
          </button>
          <button
            className={`pb-1 border-b-2 transition ${
              activeTab === "blog"
                ? "border-sky-500 text-sky-400"
                : "border-transparent hover:text-sky-300"
            }`}
            onClick={() => setActiveTab("blog")}
          >
            Blog điện ảnh
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bài nổi bật */}
        <div className="md:col-span-2">
          <div className="overflow-hidden rounded-xl shadow-lg group relative">
            <img
              src={data.featured.image}
              alt={data.featured.title}
              className="rounded-xl w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h3 className="font-semibold mt-3 hover:text-sky-400 transition">
            {data.featured.title}
          </h3>
          {activeTab === "review" && (
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <button className="bg-[#1877F2] text-white text-xs px-2 py-0.5 rounded">
                👍 Thích
              </button>
              <span>👁 {data.featured.likes}</span>
            </div>
          )}
        </div>

        {/* Các bài nhỏ */}
        <div className="flex flex-col gap-4">
          {data.sideArticles.map((post, i) => (
            <div key={i} className="flex gap-3 items-center">
              <img
                src={post.image}
                alt={post.title}
                className="w-32 h-20 object-cover rounded-lg hover:scale-105 transition"
              />
              <div>
                <h4 className="text-sm font-medium hover:text-sky-400 cursor-pointer">
                  {post.title}
                </h4>
                {activeTab === "review" && (
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="bg-[#1877F2] text-white px-2 py-0.5 rounded">
                      👍 Thích
                    </span>
                    <span>👁 {post.likes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Xem thêm */}
      <div className="text-center mt-8">
        <a
          href="#"
          className="border border-orange-500 text-orange-500 rounded-lg px-6 py-2 text-sm hover:bg-orange-500 hover:text-white transition"
        >
          Xem thêm →
        </a>
      </div>
    </section>
  );
}


function Intro(){ return (
  <section className="mt-10 text-sm leading-7 text-gray-700 dark:text-gray-300">
    <h3 className="mb-2 text-lg font-bold">Trang chủ</h3>
    <p><b>Cinesta</b> là nền tảng đặt vé xem phim trực tuyến. Tại đây bạn có thể đặt vé nhanh, chọn chỗ ngồi, mua combo và nhận ưu đãi hấp dẫn.</p>
  </section>) }

export default function Home(){
  const [now, setNow] = React.useState<any[]>([])
  const [coming, setComing] = React.useState<any[]>([])
  React.useEffect(()=>{ api.listMovies('now').then(setNow); api.listMovies('coming').then(setComing) },[])
  return (
    <div className="space-y-6">
      <Banner/>
      <QuickBuy/>
      <MovieRow title="Phim đang chiếu" data={now}/>
      <MovieRow title="Phim sắp chiếu" data={coming}/>
      <Promos/>
      <Articles/>
      <Intro/>
    </div>
  )
}
