
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import BookingBreadcrumb from '../../components/BookingBreadcrumb'

export default function Select(){
  const nav = useNavigate()
  const [movies, setMovies] = React.useState<any[]>([])
  const [theaters, setTheaters] = React.useState<any[]>([])
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
    })
    api.listTheaters().then(setTheaters)
    api.listRooms().then(setRooms)
    api.listShowtimes().then(setShowtimes)
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
    const theaterIds = new Set(theatersInCity.map((t:any)=> String(t.id)))
    return showtimes.filter(s =>
      (!movie || String(s.movieId)===String(movie)) &&
      (city ? theaterIds.has(String(s.theaterId)) : true)
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

  const selectedMovie = React.useMemo(()=> movies.find(m=> String(m.id)===String(movie)),[movies, movie])
  const selectedShowtimeObj = React.useMemo(()=> showtimes.find(st=> String(st.id)===String(selectedShowtime)) || null,[showtimes, selectedShowtime])
  const theaterNameById = React.useCallback((id:string)=>{
    const t = theaters.find(th=> String(th.id)===String(id))
    return t?.name || ''
  },[theaters])
  const roomNameById = React.useCallback((id:string)=>{
    const r = rooms.find(ro=> String(ro.id)===String(id))
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
    <div className="space-y-4">
      <div className="text-xl font-bold">Chọn phim / Rạp / Suất</div>
      <div className="card grid items-end gap-3 md:grid-cols-4">
        <div><div className="label">1. Chọn phim</div>
          <select className="input" value={movie} onChange={e=>{ setMovie(e.target.value); setShowtime('') }}>
            <option value="">-- Tất cả --</option>
            {movies.map(m=> <option key={m.id} value={m.id}>{m.title}</option>)}
          </select></div>
        <div><div className="label">2. Chọn rạp</div>
          <select className="input" value={theater} onChange={e=>{ setTheater(e.target.value); setShowtime('') }}>
            <option value="">-- Tất cả --</option>
            {theaters.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
          </select></div>
        <div className="md:col-span-2"><div className="label">3. Chọn suất</div>
          <select className="input" value={showtime} onChange={e=>setShowtime(e.target.value)}>
            <option value="">-- Chọn suất --</option>
            {filtered.map(st=> <option key={st.id} value={st.id}>{new Date(st.startTime).toLocaleString()}</option>)}
          </select></div>
      </div>
      <div className="flex justify-end"><button disabled={!showtime} className="btn-primary disabled:opacity-50" onClick={()=> nav(`/booking/seats/${showtime}`)}>Tiếp tục</button></div>
    </div>
  )
}
