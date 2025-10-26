
import React from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../lib/mockApi'

export default function Movies(){
  const [items, setItems] = React.useState<any[]>([])
  const [q, setQ] = React.useState('')
  React.useEffect(()=>{ api.listMovies().then(setItems) },[])
  const filtered = items.filter(m => m.title.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input className="input" placeholder="Tìm kiếm phim..." value={q} onChange={e=>setQ(e.target.value)}/>
      </div>
      <div className="grid-cards gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filtered.map(m => (
          <Link key={m.id} to={`/movies/${m.id}`} className="group relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
            <img src={m.poster} className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 hidden items-center justify-center gap-2 bg-black/50 group-hover:flex">
              <button className="rounded-xl bg-white/90 px-3 py-1 text-sm font-medium text-gray-900">Xem trailer</button>
              <button className="rounded-xl bg-brand px-3 py-1 text-sm font-medium text-white">Đặt vé</button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
              <div className="font-semibold">{m.title}</div>
              <div className="text-xs opacity-80">{m.genre.join(', ')}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
