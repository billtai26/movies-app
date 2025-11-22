
import React from 'react'
import { useCollection } from '../../../lib/mockCrud'
import SidebarMovieCard from '../../components/SidebarMovieCard'
import QuickBooking from '../../components/QuickBooking'

export default function Offers(){
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
        ))}
      </div>
    </div>
  )
}
