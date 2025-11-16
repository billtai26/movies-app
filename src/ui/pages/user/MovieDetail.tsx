
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import SidebarMovieCard from '../../components/SidebarMovieCard'
import CommentsSection from '../../components/CommentsSection'

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  // Tạo ngày động giống Quick Booking: hôm nay + 4 ngày tiếp theo
  const weekdayVi = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy']
  const formatShortDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  }
  const today = new Date()
  const [selectedDate, setSelectedDate] = React.useState<string>(formatShortDate(today))
  const [region, setRegion] = React.useState('all')
  const [theaterFilter, setTheaterFilter] = React.useState('all')

  const [movie, setMovie] = React.useState<any | null>(null)
  const [nowMovies, setNowMovies] = React.useState<any[]>([])
  const [movieShowtimes, setMovieShowtimes] = React.useState<any[]>([])
  const [theaters, setTheaters] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const tabsRef = React.useRef<HTMLDivElement>(null)
  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const label = i === 0 ? 'Hôm Nay' : weekdayVi[d.getDay()]
    return { label, value: formatShortDate(d) }
  })
  const currentDateIndex = React.useMemo(() => {
    return dates.findIndex(d => d.value === selectedDate)
  }, [selectedDate])
  const parseIsoWallTime = (iso?: string) => {
    if (!iso) return null
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
    if (m) return { y: m[1], mm: m[2], dd: m[3], hh: m[4], min: m[5] }
    const d = new Date(iso)
    return { y: String(d.getFullYear()), mm: String(d.getMonth()+1).padStart(2,'0'), dd: String(d.getDate()).padStart(2,'0'), hh: String(d.getHours()).padStart(2,'0'), min: String(d.getMinutes()).padStart(2,'0') }
  }
  const fmtHHmm = (iso?: string) => {
    const p = parseIsoWallTime(iso)
    if (!p) return '—'
    return `${p.hh}:${p.min}`
  }
  const ddmmFromIso = (iso?: string) => {
    const p = parseIsoWallTime(iso)
    if (!p) return ''
    return `${p.dd}/${p.mm}`
  }

  React.useEffect(() => {
    if (!id) return
    setLoading(true)
    const cinemaId = theaterFilter !== 'all' ? theaterFilter : undefined
    Promise.allSettled([
      api.getMovie(id),
      api.listShowtimesByMovie(id, cinemaId),
      api.listTheaters(),
      api.listMovies({ status: 'now_showing', limit: 3 })
    ])
      .then((results: PromiseSettledResult<any>[]) => {
        const mRes = results[0] as PromiseSettledResult<any>
        const stRes = results[1] as PromiseSettledResult<any>
        const thRes = results[2] as PromiseSettledResult<any>
        const nowRes = results[3] as PromiseSettledResult<any>
        if (mRes.status === 'fulfilled') {
          setMovie(mRes.value || null)
        } else {
          setMovie(null)
        }
        if (stRes.status === 'fulfilled') {
          const raw = stRes.value as any
          const arr = Array.isArray(raw) ? raw : (raw?.showtimes || [])
          const filtered = Array.isArray(arr) ? arr.filter((s:any) => ((s.movieId === id) || (s.movie?._id === id))) : []
          setMovieShowtimes(filtered)
        } else {
          setMovieShowtimes([])
        }
        if (thRes.status === 'fulfilled') {
          const raw = thRes.value as any
          const arr = Array.isArray(raw) ? raw : (raw?.cinemas || raw?.theaters || [])
          setTheaters(Array.isArray(arr) ? arr : [])
        } else {
          setTheaters([])
        }
        if (nowRes.status === 'fulfilled') {
          const val:any = nowRes.value
          const list = val?.movies || val || []
          setNowMovies(Array.isArray(list) ? list : [])
        } else {
          setNowMovies([])
        }
      })
      .finally(() => setLoading(false))
  }, [id, theaterFilter])

  const handleShowtimeSelect = (showtimeId: string) => {
    navigate(`/booking/seats/${showtimeId}`)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#f58a1f] mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải thông tin phim...</p>
      </div>
    </div>
  )

  if (!movie) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="mt-4 text-gray-600">Không tìm thấy phim này.</p>
        <a href="/movies" className="mt-3 inline-block px-4 py-2 bg-orange-500 text-white rounded-md">Quay lại danh sách</a>
      </div>
    </div>
  )
  const theaterSource = theaters
  const showtimesByTheater = theaterSource.map(theater => {
    const thId = String(theater.id || (theater as any)._id)
    const byTheater = movieShowtimes.filter(s => String(s.theaterId || s.cinemaId) === thId)
    const byDate = byTheater.filter(s => !!s.startTime && ddmmFromIso(s.startTime) === selectedDate)
    return { ...theater, showtimes: byDate.length ? byDate : byTheater }
  }).filter(theater => theater.showtimes.length > 0)

  const filteredTheaters = showtimesByTheater.filter(t => {
    const okRegion = region === 'all' ? true : (t.city || 'only') === region
    const okTheater = theaterFilter === 'all' ? true : ((t.id || (t as any)._id) === theaterFilter)
    return okRegion && okTheater
  })

  const goPrevDate = () => {
    if (currentDateIndex > 0) setSelectedDate(dates[currentDateIndex - 1].value)
  }
  const goNextDate = () => {
    if (currentDateIndex < dates.length - 1) setSelectedDate(dates[currentDateIndex + 1].value)
  }

  // (Loại bỏ thanh tiến trình động dưới tabs, sẽ dùng đường cố định)

  // Ref để cuộn thanh tabs bằng mũi tên (không đổi ngày)
  const scrollTabs = (dir: 'prev' | 'next') => {
    const el = tabsRef.current
    if (!el) return
    const amount = 180
    el.scrollBy({ left: dir === 'prev' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <>
      {/* Hero full-width */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
        <img src={movie.poster} className="w-full h-[360px] md:h-[500px] object-cover brightness-75" />
        {/* Overlay nhẹ giúp nút play nổi bật */}
        <div className="absolute inset-0 bg-black/20" />
        {/* Nút play ở giữa */}
        {movie.trailer && (
          <a href={movie.trailer} target="_blank" className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-md ring-2 ring-white/60 hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#f58a1f]"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            </span>
          </a>
        )}
      </div>

      {/* Nội dung chính */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
        {/* Cột trái: thông tin + lịch chiếu */}
        <div className="md:col-span-2 space-y-6">
          {/* Tiêu đề + thông tin cơ bản (poster ăn vào banner) */}
          <div className="flex items-start gap-6 -mt-14 md:-mt-20 relative z-10">
            <img src={movie.poster} className="h-80 w-[calc(13rem+0.9cm)] md:h-96 md:w-[calc(15rem+0.9cm)] rounded-xl object-cover shadow-2xl ring-1 ring-black/10" />
            <div className="flex-1 text-gray-800 mt-10 md:mt-14">
              {/* Tiêu đề + badge độ tuổi theo mẫu */}
              <div className="flex items-start gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{movie.title || (movie as any)?.name}</h1>
                <span className="mt-1 inline-block bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-md">{movie.ageRating || 'T13'}</span>
              </div>

              {/* Meta: thời lượng + ngày khởi chiếu */}
              <div className="mt-2 text-sm text-gray-600 flex items-center gap-4">
                <span>⏱ {movie.duration || 119} phút</span>
                <span>📅 {movie.releaseDate || '16/10/2025'}</span>
              </div>

              {/* Rating theo mẫu: sao + điểm + số votes */}
              <div className="mt-2 flex items-center gap-2 text-gray-800">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold text-lg">{typeof (movie as any)?.averageRating === 'number' ? (movie as any).averageRating.toFixed(1) : (movie as any)?.averageRating || (typeof movie.rating === 'number' ? movie.rating.toFixed(1) : (movie.rating || '8.2'))}</span>
                <span className="text-sm text-gray-500">({movie.votes || '173'} votes)</span>
              </div>

              {/* Quốc gia + Nhà sản xuất */}
              <div className="mt-3 space-x-6 text-gray-700">
                <span>Quốc gia: <b>{movie.country || 'Việt Nam'}</b></span>
                <span>Nhà sản xuất: <b>{movie.studio || '856 Pictures'}</b></span>
              </div>

              {/* Thể loại - hiển thị ngang, chỉ wrap khi hết chỗ */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-gray-700">Thể loại:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {(Array.isArray((movie as any)?.genre) ? (movie as any).genre : Array.isArray((movie as any)?.genres) ? (movie as any).genres : ['Gia Đình']).map((g:string) => (
                    <span key={g} className="px-2.5 py-1 rounded-full border text-sm bg-white">{g}</span>
                  ))}
                </div>
              </div>

              {/* Đạo diễn - cùng hàng với nhãn, wrap khi hết chỗ */}
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <span className="text-gray-700">Đạo diễn:</span>
                {(Array.isArray((movie as any)?.directors) ? (movie as any).directors : ['Khương Ngọc']).map((d:string) => (
                  <span key={d} className="px-2.5 py-1 rounded-full border text-sm bg-white">{d}</span>
                ))}
              </div>

              {/* Diễn viên - cùng hàng với nhãn, wrap khi hết chỗ */}
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <span className="text-gray-700">Diễn viên:</span>
                {(Array.isArray((movie as any)?.actors) ? (movie as any).actors : ['Việt Hương','Hồng Đào','Hữu Châu','Lê Khánh','Băng Di','Lâm Thanh Mỹ']).map((a:string) => (
                  <span key={a} className="px-2.5 py-1 rounded-full border text-sm bg-white">{a}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Nội dung phim theo mẫu */}
          <div id="description" className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-[2px] h-5 bg-blue-600"></span>
              <h3 className="text-lg font-semibold">Nội Dung Phim</h3>
            </div>
            <div className="text-gray-700 leading-relaxed text-sm md:text-base">
              <p>
                { (movie as any).description || 
                  'Lấy cảm hứng từ những ký ức tuổi thơ ngọt ngào, “Cục Vàng Của Ngoại” mang đến câu chuyện ấm áp về tình bà cháu trong một xóm nhỏ chan chứa nghĩa tình.' }
              </p>
              <p className="mt-3">
                {'Bà Hậu – người phụ nữ cả đời tần tảo, nay trở thành chỗ dựa duy nhất của cháu ngoại khi con gái bỏ đi. Dẫu cuộc sống còn nhiều nhọc nhằn, tình thương bà dành cho cháu vẫn luôn trọn vẹn. Với bà, cháu là “cục vàng” – niềm vui, niềm an ủi và cũng là lẽ sống của đời mình.'}
              </p>
              <p className="mt-3">
                {'Bộ phim nhẹ nhàng dẫn khán giả trở lại những khoảnh khắc quen thuộc nơi xóm nhỏ: nụ cười hồn nhiên của cháu, vòng tay chở che của bà và sự đùm bọc từ hàng xóm láng giềng. Tất cả cùng hòa thành một bức tranh đời thường ấm áp, gợi nhớ về tuổi thơ bình yên và tình người mộc mạc, chân thành.'}
              </p>
            </div>
          </div>

          {/* Lịch chiếu theo rạp */}
          <div id="schedule" className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-[2px] h-5 bg-blue-600"></span>
              <h3 className="text-lg font-semibold">Lịch Chiếu</h3>
            </div>
            {/* Hàng tabs + mũi tên + bộ lọc bên phải */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button aria-label="Cuộn trái" onClick={()=>scrollTabs('prev')} className="w-6 h-6 grid place-items-center text-gray-700 hover:text-blue-600">‹</button>
                <div ref={tabsRef} className="flex gap-3 overflow-x-auto py-2 no-scrollbar">
                  {dates.map(d => (
                    <button
                      key={d.value}
                      className={`w-20 h-14 rounded-md border shadow-sm flex flex-col items-center justify-center transition-colors ${selectedDate===d.value ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white hover:bg-blue-50'}`}
                      onClick={()=>setSelectedDate(d.value)}
                    >
                      <div className="text-xs font-medium leading-none">{d.label}</div>
                      <div className="text-[11px] opacity-80 leading-none mt-1">{d.value}</div>
                    </button>
                  ))}
                </div>
                <button aria-label="Cuộn phải" onClick={()=>scrollTabs('next')} className="w-6 h-6 grid place-items-center text-gray-700 hover:text-blue-600">›</button>
              </div>
              <div className="flex items-center gap-3">
                <select className="px-3 py-2 border rounded-md text-sm" value={region} onChange={e=>setRegion(e.target.value)}>
                  <option value="all">Toàn quốc</option>
                  <option value="only">Only Cinema</option>
                </select>
                <select className="px-3 py-2 border rounded-md text-sm" value={theaterFilter} onChange={e=>setTheaterFilter(e.target.value)}>
                  <option value="all">Tất cả rạp</option>
                  {theaterSource.map(t=> <option key={(t as any)._id || t.id} value={(t as any)._id || t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            {/* Đường ngang xanh cố định dưới tabs */}
            <div className="mt-2 h-[2px] bg-blue-600 w-full" />
            {/* Theo rạp */}
            <div className="space-y-3">
              {filteredTheaters.map(t => (
                <div key={t.id} className="rounded-xl border bg-[#fcfcfc] p-4 shadow-sm">
                  <div className="font-semibold mb-2">{t.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {t.showtimes.map(s => (
                      <button
                        key={s.id || (s as any)._id}
                        className="w-16 h-10 flex items-center justify-center rounded-md border text-sm bg-white hover:bg-blue-50 shadow-sm"
                        onClick={()=>handleShowtimeSelect(s.id || (s as any)._id)}
                      >
                        {fmtHHmm((s as any).startTime || s.time)}
                      </button>
                    ))}
                    {t.showtimes.length===0 && (
                      <div className="text-sm text-gray-500">Không có suất phù hợp</div>
                    )}
                  </div>
                </div>
              ))}
              {filteredTheaters.length===0 && (
                <div className="text-sm text-gray-500">Chưa có lịch chiếu cho phim này</div>
              )}
            </div>
          </div>

          <CommentsSection movieId={id as string} />
        </div>
        {/* Cột phải: PHIM ĐANG CHIẾU dạng dọc */}
        <aside className="space-y-6 md:ml-[3cm]">
          <div>
            <h3 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3">PHIM ĐANG CHIẾU</h3>
            <div className="space-y-3">
              {nowMovies.map((p) => (
                <div key={(p as any)._id || p.id} className="md:w-[calc(100%+2cm)]">
                  <SidebarMovieCard 
                    movie={{ id: (p as any)._id || p.id, name: p.title || (p as any).name, img: p.poster, rating: (p as any).averageRating ?? p.rating }} 
                    styleHeight="calc(12rem + 0.5cm)" 
                  />
                </div>
              ))}
            </div>
            <a
              href="/movies"
              className="block mx-auto mt-4 w-fit border border-orange-500 text-orange-500 px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition"
            >
              Xem thêm →
            </a>
          </div>
        </aside>
      </div>
    </>
  )
}
