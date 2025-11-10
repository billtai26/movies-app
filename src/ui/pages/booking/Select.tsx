
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/mockApi'
import BookingBreadcrumb from '../../components/BookingBreadcrumb'

export default function Select(){
  const nav = useNavigate()
  const [movies, setMovies] = React.useState<any[]>([])
  const [theaters, setTheaters] = React.useState<any[]>([])
  const [showtimes, setShowtimes] = React.useState<any[]>([])

  const [city, setCity] = React.useState<string>('')
  const [movie, setMovie] = React.useState('')
  const [theater, setTheater] = React.useState('')
  const [showtime, setShowtime] = React.useState('')

  React.useEffect(()=>{
    api.listMovies('now').then(setMovies)
    api.listTheaters().then(setTheaters)
    api.listShowtimes().then(setShowtimes)
  },[])

  const cities = React.useMemo(()=>{
    const all = Array.from(new Set((theaters||[]).map((t:any)=> t.city).filter(Boolean))) as string[]
    // Fallback danh sách theo mẫu nếu dữ liệu trống
    return all.length ? all : [
      'TP Hồ Chí Minh','Hà Nội','Đà Nẵng','An Giang','Bà Rịa - Vũng Tàu','Bến Tre','Cà Mau','Đắk Lắk','Hải Phòng','Khánh Hòa','Nghệ An','Tây Ninh','Thừa Thiên Huế'
    ]
  },[theaters])

  const theatersInCity = React.useMemo(()=>{
    if (!city) return theaters
    return theaters.filter((t:any)=> (t.city||'') === city)
  },[city, theaters])

  const filteredShowtimes = React.useMemo(()=>{
    return showtimes.filter(s => (!movie || s.movieId===movie) && (!theater || s.theaterId===theater))
  },[showtimes, movie, theater])

  const selectedMovie = React.useMemo(()=> movies.find(m=> String(m.id)===String(movie)),[movies, movie])

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* Thanh bước giống mẫu */}
      <BookingBreadcrumb currentStep="select"/>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        {/* Cột trái: các khối chọn theo mẫu */}
        <div className="space-y-6">
          {/* Chọn vị trí */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="label">Chọn vị trí</div>
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">i</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {cities.map((c)=> (
                <button
                  key={c}
                  className={`px-3 py-1.5 rounded-full border text-sm ${city===c? 'bg-orange-500 text-white border-orange-500':'bg-white hover:bg-orange-50'}`}
                  onClick={()=>{ setCity(c); setTheater(''); setShowtime('') }}
                >{c}</button>
              ))}
            </div>
          </div>

          {/* Chọn phim */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="label">Chọn phim</div>
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <select className="input" value={movie} onChange={e=>{ setMovie(e.target.value); setShowtime('') }}>
              <option value="">-- Tất cả --</option>
              {movies.map(m=> <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>

          {/* Chọn suất: bao gồm chọn rạp theo thành phố */}
          <div className="card grid gap-3 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="label">Chọn rạp</div>
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <select className="input" value={theater} onChange={e=>{ setTheater(e.target.value); setShowtime('') }}>
                <option value="">-- Tất cả --</option>
                {theatersInCity.map((t:any)=> <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="label">Chọn suất</div>
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <select className="input" value={showtime} onChange={e=>setShowtime(e.target.value)}>
                <option value="">-- Chọn suất --</option>
                {filteredShowtimes.map(st=> <option key={st.id} value={st.id}>{new Date(st.startTime).toLocaleString('vi-VN')}</option>)}
              </select>
            </div>
          </div>

        </div>

        {/* Cột phải: tóm tắt theo mẫu */}
        <aside className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="h-1 bg-orange-500" />
            <div className="p-4 space-y-3">
              {/* Poster hoặc placeholder */}
              <div className="flex gap-4">
                {selectedMovie?.poster ? (
                  <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-32 h-48 rounded-md object-cover" />
                ) : (
                  <div className="w-32 h-48 rounded-md border flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10"><path fill="currentColor" d="M4 5h16v14H4z"/><path fill="#fff" d="M7 8h10v8H7z"/></svg>
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold">{selectedMovie?.title || '-'}</div>
                </div>
              </div>
              <hr className="border-dashed" />
              <div className="flex items-center justify-between">
                <span>Tổng cộng</span>
                <b className="text-xl text-orange-600">0 đ</b>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button className="btn-back" onClick={()=>nav('/')}>Quay lại</button>
            <button
              className="btn-next disabled:opacity-50"
              disabled={!showtime}
              onClick={()=> nav(`/booking/seats/${showtime}`)}
            >Tiếp tục</button>
          </div>
        </aside>
      </div>
    </div>
  )
}
