
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import BookingBreadcrumb from '../../components/BookingBreadcrumb'

export default function Select(){
  const nav = useNavigate()
  const [movies, setMovies] = React.useState<any[]>([])
  const [theaters, setTheaters] = React.useState<any[]>([])
  const [rooms, setRooms] = React.useState<any[]>([])
  const [showtimes, setShowtimes] = React.useState<any[]>([])

  const [city, setCity] = React.useState('')
  const [movie, setMovie] = React.useState('')
  const [selectedShowtime, setSelectedShowtime] = React.useState('')
  const [expandedMovie, setExpandedMovie] = React.useState(false)
  const [expandedShowtime, setExpandedShowtime] = React.useState(false)

  React.useEffect(()=>{
    api.listMovies({ status: 'now_showing' }).then((res: any) => {
      const list = (res && (res.movies || res.data)) || res
      setMovies(Array.isArray(list) ? list : [])
    }).catch(()=> setMovies([]))
    api.listTheaters().then((res:any)=>{
      const raw = Array.isArray(res) ? res : (res.cinemas || res.theaters || res.data || [])
      const list = (Array.isArray(raw) ? raw : []).map((t:any)=> ({ id: (t._id || t.id), name: t.name, city: t.city || t.location?.city || t.region }))
      setTheaters(list)
    }).catch(()=> setTheaters([]))
    api.listRooms().then((res:any)=>{
      const raw = Array.isArray(res) ? res : (res.cinemaHalls || res.rooms || res.data || [])
      const list = (Array.isArray(raw) ? raw : []).map((r:any)=> ({ id: (r._id || r.id), name: r.name || r.hallName }))
      setRooms(list)
    }).catch(()=> setRooms([]))
    api.listShowtimes().then((res:any)=>{
      const raw = Array.isArray(res) ? res : (res.showtimes || res.data || [])
      const list = (Array.isArray(raw) ? raw : []).map((s:any)=> ({
        id: (s._id || s.id),
        movieId: s.movieId || s.movie?._id || s.movie,
        theaterId: s.theaterId || s.cinemaId || s.cinema?._id || s.theater,
        roomId: s.roomId || s.hallId || s.cinemaHall?._id || s.room,
        startTime: s.startTime || s.start_at || s.startAt,
        price: s.price || s.basePrice || 0,
      }))
      setShowtimes(list)
    }).catch(()=> setShowtimes([]))
  },[])

  // Danh sách thành phố rút ra từ dữ liệu rạp (fallback nếu trống)
  const cities = React.useMemo(()=>{
    const all = Array.from(new Set((theaters||[]).map((t:any)=> t.city).filter(Boolean))) as string[]
    return all.length ? all : [
      'TP Hồ Chí Minh','Hà Nội','Đà Nẵng','An Giang','Bà Rịa - Vũng Tàu','Bến Tre','Cà Mau','Đắk Lắk','Hải Phòng','Khánh Hòa','Nghệ An','Tây Ninh','Thừa Thiên Huế'
    ]
  },[theaters])

  const theatersInCity = React.useMemo(()=>{
    if (!city) return []
    return theaters.filter((t:any)=> (t.city||'') === city)
  },[city, theaters])

  // Lọc suất theo phim đã chọn và rạp thuộc thành phố đã chọn
  const filteredShowtimes = React.useMemo(()=>{
    const theaterIds = new Set(theatersInCity.map((t:any)=> String((t._id || t.id))))
    return showtimes.filter(s =>
      (!movie || String(s.movieId)===String(movie)) &&
      (city ? theaterIds.has(String((s as any).theaterId)) : true)
    )
  },[showtimes, movie, city, theatersInCity])

  // Group suất theo ngày (dateKey) và chuẩn bị nhãn hiển thị như mẫu
  const dateGroups = React.useMemo(()=>{
    const map = new Map<string, { dateKey: string, date: Date, labelTop: string, labelBottom: string, items: any[] }>()
    const pad = (n:number)=> String(n).padStart(2,'0')
    filteredShowtimes.forEach(st => {
      const d = new Date(st.startTime)
      const dateKey = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
      if (!map.has(dateKey)){
        const today = new Date()
        const isToday = today.getFullYear()===d.getFullYear() && today.getMonth()===d.getMonth() && today.getDate()===d.getDate()
        const weekday = d.toLocaleDateString('vi-VN', { weekday:'long' })
        const top = isToday ? 'Hôm Nay' : weekday.charAt(0).toUpperCase() + weekday.slice(1)
        const bottom = `${pad(d.getDate())}/${pad(d.getMonth()+1)}`
        map.set(dateKey, { dateKey, date: d, labelTop: top, labelBottom: bottom, items: [] })
      }
      map.get(dateKey)!.items.push(st)
    })
    return Array.from(map.values()).sort((a,b)=> a.date.getTime()-b.date.getTime())
  },[filteredShowtimes])

  const [activeDateKey, setActiveDateKey] = React.useState<string>('')
  React.useEffect(()=>{
    setActiveDateKey(dateGroups[0]?.dateKey || '')
  },[dateGroups])

  // Nhóm theo rạp cho ngày được chọn
  const itemsForActiveDate = React.useMemo(()=> {
    return dateGroups.find(g=> g.dateKey===activeDateKey)?.items || []
  },[dateGroups, activeDateKey])

  const theaterGroups = React.useMemo(()=>{
    const groups: Record<string, any[]> = {}
    itemsForActiveDate.forEach(st => {
      const key = String(st.theaterId)
      groups[key] = groups[key] || []
      groups[key].push(st)
    })
    return groups
  },[itemsForActiveDate])

  const [theaterFilter, setTheaterFilter] = React.useState<string>('')

  const selectedMovie = React.useMemo(()=> movies.find(m=> String((m as any)._id || m.id)===String(movie)),[movies, movie])
  const selectedShowtimeObj = React.useMemo(()=> showtimes.find(st=> String((st as any)._id || st.id)===String(selectedShowtime)) || null,[showtimes, selectedShowtime])
  const theaterNameById = React.useCallback((id:string)=>{
    const t = theaters.find(th=> String((th as any)._id || th.id)===String(id))
    return t?.name || ''
  },[theaters])
  const roomNameById = React.useCallback((id:string)=>{
    const r = rooms.find(ro=> String((ro as any)._id || ro.id)===String(id))
    return r?.name || ''
  },[rooms])

  const canPickMovie = !!city

  // Tự động mở/đóng các section theo điều kiện
  React.useEffect(()=>{
    // Chọn vị trí xong: mở phần chọn phim, đóng phần suất
    setExpandedMovie(!!city)
    setExpandedShowtime(false)
  },[city])

  React.useEffect(()=>{
    // Chọn phim xong: đóng phần phim, mở phần suất
    if (!!movie && !!city) {
      setExpandedMovie(false)
      setExpandedShowtime(true)
    } else {
      setExpandedShowtime(false)
    }
    setSelectedShowtime('')
  },[movie, city])

  React.useEffect(()=>{
    // Khi đã chọn suất: tự đóng phần suất cho gọn, vẫn cho bấm mũi tên để xem lại
    if (selectedShowtime) setExpandedShowtime(false)
  },[selectedShowtime])

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <BookingBreadcrumb currentStep="select"/>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        {/* Cột trái: 3 khối theo mẫu */}
        <div className="space-y-6">
          {/* Chọn vị trí */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="label">Chọn vị trí</div>
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">i</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {cities.map((c)=> (
                <button
                  key={c}
                  className={`px-3 py-1.5 rounded-full border text-sm ${city===c? 'bg-orange-500 text-white border-orange-500':'bg-white hover:bg-orange-50'}`}
                  onClick={()=>{ setCity(c); setMovie(''); setSelectedShowtime('') }}
                >{c}</button>
              ))}
            </div>
          </div>

          {/* Chọn phim (ẩn cho tới khi chọn vị trí) */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="label">Chọn phim {selectedMovie?.title ? `- ${selectedMovie.title}` : ''}</div>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={()=> canPickMovie && setExpandedMovie(v=>!v)}
                aria-label="Toggle chọn phim"
              >
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedMovie?'rotate-180':''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            {expandedMovie ? (
              <div className="space-y-3 opacity-100">
                {movies.map(m => {
                  const mId = (m as any)._id || m.id
                  const active = String(movie)===String(mId)
                  return (
                    <button key={mId}
                      className={`w-full film-list border rounded-lg p-2 flex items-center gap-3 ${active?'border-orange-500 bg-orange-50':''}`}
                      onClick={()=> setMovie(String(mId))}
                    >
                      <img src={(m as any).posterUrl || m.poster || 'https://picsum.photos/200/200'} alt={(m as any).title || (m as any).name} className="w-16 h-20 object-cover rounded" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{(m as any).title || (m as any).name}</div>
                      </div>
                      <div className="film-number"><span className="px-2 py-1 rounded bg-gray-100">{(m as any).ageRating || 'C16'}</span></div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Vui lòng chọn vị trí trước.</div>
            )}
          </div>

          {/* Chọn suất (ẩn cho tới khi có vị trí + phim) */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="label">Chọn suất</div>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={()=> (city && movie) && setExpandedShowtime(v=>!v)}
                aria-label="Toggle chọn suất"
              >
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedShowtime?'rotate-180':''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            {expandedShowtime ? (
              <div className="movie-time space-y-4">
                {/* Tabs ngày */}
                <div className="flex items-center gap-3">
                  {dateGroups.map(g=> (
                    <button key={g.dateKey}
                      className={`flex flex-col items-center justify-center px-3 py-2 rounded border ${activeDateKey===g.dateKey?'bg-blue-600 text-white border-blue-600':'bg-white'}`}
                      onClick={()=> setActiveDateKey(g.dateKey)}
                    >
                      <span className="text-xs font-semibold">{g.labelTop}</span>
                      <span className="text-xs">{g.labelBottom}</span>
                    </button>
                  ))}
                  {/* Bộ lọc rạp */}
                  <select
                    className="ml-auto input max-w-[200px]"
                    value={theaterFilter}
                    onChange={(e)=> setTheaterFilter(e.target.value)}
                  >
                    <option value="">Tất cả các rạp</option>
                    {Object.keys(theaterGroups).map(tid=> (
                      <option key={tid} value={tid}>{theaterNameById(tid)}</option>
                    ))}
                  </select>
                </div>

                {/* Nhóm theo rạp */}
                {Object.entries(theaterGroups)
                  .filter(([tid])=> !theaterFilter || theaterFilter===tid)
                  .map(([tid, items])=> (
                    <div key={tid} className="movie-time-content space-y-2">
                      <h4 className="font-semibold">{theaterNameById(tid)}</h4>
                      <div className="movie-time-text">
                        <p className="text-sm text-gray-600">2D Phụ Đề</p>
                        <div className="movie-time-btn flex flex-wrap gap-2 mt-2">
                          {items
                            .sort((a:any,b:any)=> new Date(a.startTime).getTime()-new Date(b.startTime).getTime())
                            .map((st:any)=> (
                              <button key={(st as any)._id || st.id}
                                className={`px-3 py-1.5 rounded border hover:bg-orange-50 ${String(selectedShowtime)===String(st.id)?'border-orange-500 bg-orange-50':''}`}
                                onClick={()=> setSelectedShowtime(String((st as any)._id || st.id))}
                              >{new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute:'2-digit' })}</button>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Vui lòng chọn vị trí và phim để hiển thị suất chiếu.</div>
            )}
          </div>
        </div>

        {/* Cột phải: tóm tắt (đồng bộ style với trang Chọn ghế) */}
        <aside className="space-y-4 md:sticky md:top-4">
          <div className="card p-5 space-y-4">
            <div className="flex gap-4">
              {((selectedMovie as any)?.posterUrl || selectedMovie?.poster) ? (
                <img src={(selectedMovie as any).posterUrl || (selectedMovie as any).poster} alt={(selectedMovie as any)?.title || (selectedMovie as any)?.name} className="h-48 w-32 rounded-lg object-cover" />
              ) : (
                <div className="h-48 w-32 rounded-lg border flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10"><path fill="currentColor" d="M4 5h16v14H4z"/><path fill="#fff" d="M7 8h10v8H7z"/></svg>
                </div>
              )}
              <div className="text-base">
                <div className="text-xl font-semibold leading-tight">{(selectedMovie as any)?.title || (selectedMovie as any)?.name || '-'}</div>
                <div className="text-sm text-gray-700 flex items-center gap-2 mt-2">
                  <span>2D Phụ Đề</span>
                  {(()=>{
                    const badge = (selectedMovie as any)?.ageRating ?? ((selectedMovie as any)?.rating!=null ? `T${(selectedMovie as any).rating}` : null)
                    return badge ? <span className="inline-block px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-700">{badge}</span> : null
                  })()}
                </div>
              </div>
            </div>
            {/* Rạp và suất chiếu đặt dưới poster */}
            <div className="mt-2 text-base">
              {selectedShowtimeObj ? (
                <>
                  <div className="opacity-80">{theaterNameById(String(selectedShowtimeObj.theaterId))}{selectedShowtimeObj.roomId ? ` - ${roomNameById(String(selectedShowtimeObj.roomId))}` : ''}</div>
                  <div className="opacity-80">Suất: <b>{new Date(selectedShowtimeObj.startTime).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</b> - {new Date(selectedShowtimeObj.startTime).toLocaleDateString('vi-VN',{weekday:'long'})}, {new Date(selectedShowtimeObj.startTime).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'})}</div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Chưa chọn suất</div>
              )}
            </div>
            <hr className="border-dashed dark:border-gray-700" />
            <div className="flex items-center justify-between mt-2 text-xl font-bold">
              <span>Tổng cộng</span>
              <b className="text-2xl text-orange-600">{selectedShowtimeObj?.price ? `${selectedShowtimeObj.price.toLocaleString('vi-VN')} đ` : '0 đ'}</b>
            </div>
          </div>
          <div className="flex justify-between">
            <button className="btn-back" onClick={()=>nav('/')}>Quay lại</button>
            <button
              className="btn-next disabled:opacity-50"
              disabled={!selectedShowtime}
              onClick={()=> nav(`/booking/seats/${selectedShowtime}`)}
            >Tiếp tục</button>
          </div>
        </aside>
      </div>
    </div>
  )
}
