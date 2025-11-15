
import React from 'react'
import { useNavigate } from 'react-router-dom'


export default function Select(){
  const nav = useNavigate()
  const [movies, setMovies] = React.useState<any[]>([])
  const [theaters, setTheaters] = React.useState<any[]>([])
  const [showtimes, setShowtimes] = React.useState<any[]>([])
  const [movie, setMovie] = React.useState(''); const [theater, setTheater] = React.useState(''); const [showtime, setShowtime] = React.useState('')
  React.useEffect(()=>{ api.listMovies('now').then(setMovies); api.listTheaters().then(setTheaters); api.listShowtimes().then(setShowtimes) },[])
  const filtered = showtimes.filter(s => (!movie || s.movieId===movie) && (!theater || s.theaterId===theater))
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
