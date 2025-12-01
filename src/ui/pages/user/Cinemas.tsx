
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import Banner from '../../components/Banner'

function useQuery(){
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const weekdayViFull = (d: Date) => {
  const w = d.getDay();
  return w === 0
    ? 'Chủ Nhật'
    : w === 1
    ? 'Thứ Hai'
    : w === 2
    ? 'Thứ Ba'
    : w === 3
    ? 'Thứ Tư'
    : w === 4
    ? 'Thứ Năm'
    : w === 5
    ? 'Thứ Sáu'
    : 'Thứ Bảy';
};

export default function Cinemas(){
  const q = useQuery();
  const theaterId = q.get('theater') || '';
  const nav = useNavigate();
  const [theaters, setTheaters] = React.useState<any[]>([])
  const [movies, setMovies] = React.useState<any[]>([])
  const [showtimes, setShowtimes] = React.useState<any[]>([])
  React.useEffect(()=>{
    api.listTheaters().then((res:any)=>{
      const arr = Array.isArray(res) ? res : (res.cinemas || res.theaters || res.data || [])
      const list = (Array.isArray(arr)?arr:[]).map((t:any)=> ({ id: (t._id||t.id), name: t.name, city: t.city || t.location?.city || t.region, address: t.address }))
      setTheaters(list)
    }).catch(()=> setTheaters([]))
    api.listMovies().then((res:any)=>{
      const arr = res?.movies || res?.data || res || []
      setMovies(Array.isArray(arr)?arr:[])
    }).catch(()=> setMovies([]))
    api.listShowtimes().then((res:any)=>{
      const arr = Array.isArray(res) ? res : (res.showtimes || res.data || [])
      const list = (Array.isArray(arr)?arr:[]).map((s:any)=> ({ id:(s._id||s.id), movieId: s.movieId || s.movie?._id || s.movie, theaterId: s.theaterId || s.cinemaId || s.cinema?._id, roomId: s.roomId || s.hallId || s.cinemaHall?._id, startTime: s.startTime || s.start_at || s.startAt }))
      setShowtimes(list)
    }).catch(()=> setShowtimes([]))
  },[])

  const hotline = '1900 2224';

  // Lọc suất chiếu theo rạp
  const theater = React.useMemo(()=> theaters.find((t:any)=> String(t.id)===String(theaterId)) || null,[theaters, theaterId])
  const stForTheater = React.useMemo(() => (
    showtimes.filter((s:any)=> String(s.theaterId) === String(theaterId))
  ), [showtimes, theaterId]);
  const movieById = (id:string) => movies.find((m:any)=> String((m as any)._id || m.id)===String(id));

  // Tabs ngày: Hôm nay + 3 ngày tiếp theo
  const days = React.useMemo(()=>{
    const times = stForTheater.map((s:any)=> new Date(s.startTime))
    const base = times.length>0 ? new Date(Math.min(...times.map((d:Date)=> d.getTime()))) : new Date()
    const dow = base.getDay()
    const diffToMon = dow===0 ? -6 : 1 - dow
    const mon = new Date(base)
    mon.setDate(base.getDate()+diffToMon)
    const out: Date[] = []
    for(let i=0;i<7;i++){ const d = new Date(mon); d.setDate(mon.getDate()+i); out.push(d) }
    return out.map((d,i)=>{
      const label = weekdayViFull(d)
      const dateStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
      return { key:i, label, dateStr, date:d }
    })
  },[stForTheater])
  const [activeDay, setActiveDay] = React.useState(0);
  React.useEffect(()=>{
    if (activeDay >= days.length) setActiveDay(0)
  }, [days.length])
  const showtimesForActive = stForTheater.filter((s:any)=>{
    const sd = new Date(s.startTime);
    const ad = days[activeDay].date;
    return sd.getFullYear()===ad.getFullYear() && sd.getMonth()===ad.getMonth() && sd.getDate()===ad.getDate();
  });

  // Chọn phim để hiển thị suất chiếu như mẫu
  const [selectedMovieId, setSelectedMovieId] = React.useState<string>('');
  React.useEffect(()=>{
    // Nếu phim đang chọn không có trong ngày active thì bỏ chọn
    const has = showtimesForActive.some((s:any)=> String(s.movieId)===String(selectedMovieId))
    if (!has) setSelectedMovieId('')
  },[showtimesForActive])
  const selectedShowtimes = React.useMemo(()=>
    showtimesForActive
      .filter((s:any)=> String(s.movieId)===String(selectedMovieId))
      .sort((a:any,b:any)=> new Date(a.startTime).getTime()-new Date(b.startTime).getTime())
  ,[showtimesForActive, selectedMovieId])

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* Banner giống Home */}
      <div className="w-full">
        <Banner />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Tiêu đề và thông tin rạp */}
      {theater && (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{theater.name}</h1>
          <div className="text-sm text-gray-600 mt-2 space-y-1">
            <div>Địa chỉ: {theater.address || 'Đang cập nhật'}, {theater.city}</div>
            <div>Hotline: {hotline}</div>
          </div>
          {/* Bộ lọc tỉnh thành và rạp (mô phỏng giống ảnh) */}
          <div className="flex gap-3 mt-4">
            <select className="border rounded px-3 py-2 text-sm" defaultValue={theater?.city || ''}>
              {[...new Set(theaters.map((t:any)=> t.city).filter(Boolean))].map((c:string)=> (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className="border rounded px-3 py-2 text-sm" defaultValue={String(theater?.id)} onChange={(e)=>{ const params = new URLSearchParams(window.location.search); params.set('theater', e.target.value); window.history.replaceState(null,'',`/cinemas?${params.toString()}`); }}>
              {theaters.filter((t:any)=> t.city===theater?.city).map((t:any)=> (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* PHIM */}
      <div className="bg-white rounded-xl border p-4 mb-8">
        <div className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-4">PHIM</div>
        <div className="flex gap-3 items-center mb-3 border-b-2 border-[#1d64c2] pb-2">
          {days.map(d=> (
            <button
              key={d.key}
              onClick={()=> setActiveDay(d.key)}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                activeDay===d.key
                  ? 'bg-[#1d64c2] text-white'
                  : 'text-gray-700 hover:text-[#1d64c2]'
              }`}
            >
              <div className="font-medium">{d.label}</div>
              <div className={`text-xs ${activeDay===d.key ? 'text-white/90' : 'text-gray-500'}`}>{d.dateStr}</div>
            </button>
          ))}
        </div>

        {/* Lưới phim theo suất chiếu */}
        {showtimesForActive.length>0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {showtimesForActive.map((s:any)=>{
              const m = movieById(s.movieId);
              if(!m) return null;
              return (
                <div key={s.id} className="group cursor-pointer" onClick={()=> setSelectedMovieId(String(s.movieId))}>
                  <div className="relative rounded-lg overflow-hidden">
                    <img src={(m as any).posterUrl || m.poster} alt={(m as any).title || (m as any).name} className="w-full h-64 object-cover"/>
                    {m.rating!=null && <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{m.rating}</div>}
                    {String(selectedMovieId)===String(s.movieId) && (
                      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm font-medium group-hover:text-[#f58a1f]">{(m as any).title || (m as any).name}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">Chưa có suất chiếu cho ngày này.</div>
        )}
        {/* Panel suất chiếu của phim đã chọn */}
        {selectedMovieId && selectedShowtimes.length>0 && (
          <div className="mt-4 border rounded-lg p-4 bg-white">
            <div className="font-semibold mb-2">Suất chiếu</div>
            <div className="text-sm text-gray-600">{(movies.find(m=> String(((m as any)._id||m.id))===String(selectedMovieId)) as any)?.format || '2D Phụ Đề'}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedShowtimes.map((st:any)=> (
                <button key={(st as any)._id || st.id}
                  className="px-3 py-1.5 rounded border hover:bg-orange-50"
                  onClick={()=> nav(`/booking/seats/${(st as any)._id || st.id}`)}
                >{new Date(st.startTime).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Giá vé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-[#f58a1f] font-semibold mb-4">GIÁ VÉ</div>
          <img src="https://i.imgur.com/JbHcC1w.png" alt="ticket-prices" className="w-full rounded"/>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-[#f58a1f] font-semibold mb-2">THÔNG TIN CHI TIẾT</div>
          {theater && (
            <>
              <div className="text-sm">Địa chỉ: <span className="font-medium">{theater.address || 'Đang cập nhật'}, {theater.city}</span></div>
              <div className="text-sm">Số điện thoại: <span className="font-medium">{hotline}</span></div>
            </>
          )}
          <div className="mt-3 h-64">
            {theater && (
              <iframe title="map" className="w-full h-full rounded" src={`https://www.google.com/maps?q=${encodeURIComponent(`${theater.address || ''} ${theater.city || ''}`)}&output=embed`}></iframe>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
