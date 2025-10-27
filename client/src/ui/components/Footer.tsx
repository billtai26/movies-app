
import React from 'react'
export default function Footer(){
  return (
    <footer className="mt-12 border-t p-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        <div>
          <div className="text-xl font-bold text-brand">Cinesta</div>
          <p className="mt-2">Đặt vé xem phim nhanh chóng. Hotline: 1900 0000</p>
        </div>
        <div>
          <div className="font-semibold">Hệ thống rạp</div>
          <ul className="mt-2 space-y-1">
            <li>LandMark 81</li>
            <li>Crescent Mall</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Kết nối</div>
          <ul className="mt-2 space-y-1">
            <li>Facebook • YouTube • TikTok</li>
            <li>&copy; 2025 Cinesta</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
