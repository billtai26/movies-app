
import React from 'react'
import { useCollection } from '../../../lib/mockCrud'
import SidebarMovieCard from '../../components/SidebarMovieCard'
import QuickBooking from '../../components/QuickBooking'

export default function Offers(){
  const { rows: movies = [] } = useCollection<any>('movies')
  const nowMovies = movies.filter((m:any)=> m.status==='now').slice(0,3)

  const promos = [
    { id: 1, title: 'Bắp Cơm Yummy Yummy', img: 'https://picsum.photos/600/300?random=401', desc: 'Ưu đãi bắp nước cực đã, áp dụng tại hệ thống rạp.' },
    { id: 2, title: 'IMAX Treasure Hunt', img: 'https://picsum.photos/600/300?random=402', desc: 'Khám phá IMAX – săn quà hấp dẫn.' },
    { id: 3, title: 'Nhập Mã MomoGalaxy', img: 'https://picsum.photos/600/300?random=403', desc: 'Đã đóng gói, quà tặng đập hộp cực chất.' },
    { id: 4, title: 'ZaloPay Nhập Mã Nhận Ưu Đãi', img: 'https://picsum.photos/600/300?random=404', desc: 'Giảm giá cho đơn hàng combo bắp nước.' },
    { id: 5, title: 'Lì Xì Bắp Nước 60K', img: 'https://picsum.photos/600/300?random=405', desc: 'Mua vé xem phim nhận ưu đãi hấp dẫn.' },
    { id: 6, title: 'Combo Siêu Tiết Kiệm', img: 'https://picsum.photos/600/300?random=406', desc: 'Combo bắp nước giá tốt dành cho bạn.' },
  ]

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột trái: ưu đãi */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold border-l-4 border-blue-600 pl-2 mb-4">ƯU ĐÃI</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {promos.map((p)=> (
              <div key={p.id} className="rounded-xl overflow-hidden border hover:shadow-md transition bg-white">
                <img src={p.img} alt={p.title} className="w-full h-[200px] object-cover" />
                <div className="p-3">
                  <div className="font-medium text-sm mb-2 leading-snug text-gray-800">{p.title}</div>
                  <p className="text-sm text-gray-600">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: sidebar giống blog */}
        <aside className="space-y-6">
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-orange-500 text-white text-center py-2 font-medium">Mua Vé Nhanh</div>
            <div className="p-3">
              <QuickBooking stacked className="shadow-none border-none" />
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3">PHIM ĐANG CHIẾU</h3>
            <div className="space-y-3">
              {nowMovies.map((m:any)=> (
                <SidebarMovieCard key={m.id} movie={{ id:m.id, title:m.title, img:m.poster, rating:m.rating }} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
