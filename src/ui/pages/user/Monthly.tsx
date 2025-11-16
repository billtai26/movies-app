import React from 'react'
import { useCollection } from '../../../lib/mockCrud'
import SidebarMovieCard from '../../components/SidebarMovieCard'
import QuickBooking from '../../components/QuickBooking'

export default function Monthly(){
  const { rows: movies = [] } = useCollection<any>('movies')
  const nowMovies = movies.filter((m:any)=> m.status==='now')

  // Bài viết Phim Hay Tháng (sử dụng layout giống MovieBlog)
  const articles = [
    {
      id: 'a1',
      month: '11.2025',
      title: 'Predator Đại Chiến Zootopia',
      thumb: nowMovies[0]?.poster || 'https://via.placeholder.com/320x180?text=Predator',
      excerpt:
        'Tháng 11 khởi đầu đầy hứng khởi, hãy mở ví và đến rạp để hoà vào không khí...',
    },
    {
      id: 'a2',
      month: '10.2025',
      title: 'Mùa Mưa Quỷ',
      thumb: nowMovies[1]?.poster || 'https://via.placeholder.com/320x180?text=Mua+Mua+Quy',
      excerpt:
        'Những cơn mưa khiến góc điện ảnh trở nên rùng rợn và hấp dẫn hơn bao giờ hết...',
    },
    {
      id: 'a3',
      month: '09.2025',
      title: 'Những Cuộc Chiến Nghiệt Thở',
      thumb: nowMovies[2]?.poster || 'https://via.placeholder.com/320x180?text=Cuoc+Chien',
      excerpt:
        'Galaxy Cinema giới thiệu loạt phim hành động nghẹt thở, đừng bỏ lỡ...',
    },
    {
      id: 'a4',
      month: '08.2025',
      title: 'Trí Ân Những Người Hùng',
      thumb: nowMovies[3]?.poster || 'https://via.placeholder.com/320x180?text=Tri+An',
      excerpt:
        'Một tháng dành cho những câu chuyện người hùng đầy cảm hứng, chạm tới trái tim...',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột trái: danh sách bài theo layout blog */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold border-l-4 border-blue-600 pl-2 mb-4">
            PHIM HAY THÁNG
          </h2>
          <div className="space-y-6">
            {articles.map((a) => (
              <div key={a.id} className="flex flex-col md:flex-row border-b border-gray-200 pb-4 gap-4">
                <div className="w-full md:w-56 h-40 rounded-md overflow-hidden bg-gray-100">
                  <img src={a.thumb} alt={a.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-800 leading-snug line-clamp-2">
                    Phim Hay Tháng {a.month}: {a.title}
                  </h3>
                  <div className="text-xs text-gray-500 mt-1">Galaxy Cinema</div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-2">{a.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: sidebar giống MovieBlog */}
        <aside className="space-y-6">
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-orange-500 text-white text-center py-2 font-medium">
              Mua Vé Nhanh
            </div>
            <div className="p-3">
              <QuickBooking stacked className="shadow-none border-none" />
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold border-l-4 border-blue-600 pl-2 mb-3">
              PHIM ĐANG CHIẾU
            </h3>
            <div className="space-y-3">
              {nowMovies.slice(0,3).map((m:any)=> (
                <SidebarMovieCard key={m.id} movie={{ id:m.id, title:m.title, img:m.poster, rating:m.rating }} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}