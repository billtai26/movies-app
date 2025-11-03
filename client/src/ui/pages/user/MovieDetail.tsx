
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../../lib/mockApi'

export default function MovieDetail(){
  const { id } = useParams()
  const [movie, setMovie] = React.useState<any>(null)
  const [showtimes, setShowtimes] = React.useState<any[]>([])
  React.useEffect(()=>{ if(!id) return; api.getMovie(id).then(setMovie); api.listShowtimesByMovie(id).then(setShowtimes)},[id])
  if(!movie) return <div>Đang tải...</div>
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl">
        <img src={movie.poster} className="h-64 w-full object-cover blur-sm brightness-75 md:h-80" />
        <div className="absolute inset-0 flex items-center gap-6 p-6">
          <img src={movie.poster} className="hidden h-60 w-44 rounded-2xl object-cover shadow-2xl md:block" />
          <div className="text-white">
            <h1 className="text-3xl font-extrabold">{movie.title}</h1>
            <p className="mt-2 max-w-2xl text-sm opacity-90">{movie.synopsis}</p>
            <div className="mt-2 text-sm opacity-90">Thể loại: {movie.genre.join(', ')} • {movie.duration} phút • P{movie.rating}</div>
            <div className="mt-4 flex gap-2">
              <a href={movie.trailer} target="_blank" className="btn-outline">Xem trailer</a>
              <a href="#schedule" className="btn-primary">Đặt vé</a>
            </div>
          </div>
        </div>
      </div>
      <div id="schedule">
        <h3 className="mb-2 text-lg font-semibold">Lịch chiếu</h3>
        <div className="flex flex-wrap gap-2">
          {showtimes.map(st => (<Link to={`/booking/${st.id}`} key={st.id} className="btn-outline">{new Date(st.startTime).toLocaleString()}</Link>))}
        </div>
      </div>
    </div>
  )
}
