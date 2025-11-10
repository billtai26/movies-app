
import React from 'react'
import { useLocation } from 'react-router-dom'
import { useDoc, useCollection } from '../../../lib/mockCrud'
import Banner from '../../components/Banner'

function useQuery(){
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function Cinemas(){
  const q = useQuery();
  const theaterId = q.get('theater') || '';
  const { row: theater } = useDoc<any>('theaters', theaterId);
  const { rows: movies = [] } = useCollection<any>('movies');
  const { rows: showtimes = [] } = useCollection<any>('showtimes');

  const hotline = '1900 2224';

  // Lọc suất chiếu theo rạp
  const stForTheater = showtimes.filter((s:any)=> s.theaterId === theaterId);
  const movieById = (id:string) => movies.find((m:any)=> m.id===id);

  // Tabs ngày: Hôm nay + 3 ngày tiếp theo
  const baseDate = new Date('2025-11-02');
  const days = Array.from({length:4}).map((_,i)=>{
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate()+i);
    const label = i===0 ? 'Hôm Nay' : d.toLocaleDateString('vi-VN', { weekday:'short' });
    const dateStr = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`;
    return { key: i, label, dateStr, date: d };
  });
  const [activeDay, setActiveDay] = React.useState(0);
  const showtimesForActive = stForTheater.filter((s:any)=>{
    const sd = new Date(s.startTime);
    const ad = days[activeDay].date;
    return sd.getFullYear()===ad.getFullYear() && sd.getMonth()===ad.getMonth() && sd.getDate()===ad.getDate();
  });

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
            <select className="border rounded px-3 py-2 text-sm">
              <option value="HCM">TP Hồ Chí Minh</option>
            </select>
            <select className="border rounded px-3 py-2 text-sm">
              <option value={theater.id}>{theater.name}</option>
            </select>
          </div>
        </div>
      )}

      {/* PHIM */}
      <div className="bg-white rounded-xl border p-4 mb-8">
        <div className="text-[#f58a1f] font-semibold mb-4">PHIM</div>
        {/* Tabs ngày */}
        <div className="flex gap-3 items-end mb-4">
          {days.map(d=> (
            <button key={d.key} onClick={()=> setActiveDay(d.key)} className={`px-4 py-2 rounded-t-lg text-sm border-b-2 ${activeDay===d.key ? 'border-[#f58a1f] text-[#f58a1f]' : 'border-transparent text-gray-600'}`}>
              <div className="font-medium">{d.label}</div>
              <div className="text-xs text-gray-500">{d.dateStr}</div>
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
                <div key={s.id} className="group">
                  <div className="relative rounded-lg overflow-hidden">
                    <img src={m.poster} alt={m.title} className="w-full h-64 object-cover"/>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{m.rating}</div>
                  </div>
                  <div className="mt-2 text-sm font-medium group-hover:text-[#f58a1f]">{m.title}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">Chưa có suất chiếu cho ngày này.</div>
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
