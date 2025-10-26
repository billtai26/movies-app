import React from 'react'
import { ClipboardList } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import DarkToggle from '../components/DarkToggle'
import { useAuth } from '../../store/auth'
import {
  LayoutDashboard, Clapperboard, Shapes, Building2, Rows3,
  CalendarClock, Users, Percent, MessageSquare, Bell, ChartPie, Ticket
} from 'lucide-react'

export default function AdminLayout() {
  const items = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16}/> },
    { to: '/admin/movies', label: 'Phim', icon: <Clapperboard size={16}/> },
    { to: '/admin/genres', label: 'Thể loại', icon: <Shapes size={16}/> },
    { to: '/admin/theaters', label: 'Rạp/cụm', icon: <Building2 size={16}/> },
    { to: '/admin/rooms-seats', label: 'Phòng & Ghế', icon: <Rows3 size={16}/> },
    { to: '/admin/showtimes', label: 'Lịch chiếu', icon: <CalendarClock size={16}/> },
    { to: '/admin/users', label: 'Người dùng', icon: <Users size={16}/> },
    { to: '/admin/promotions', label: 'Khuyến mãi', icon: <Percent size={16}/> },
    { to: '/admin/combos', label: 'Combo', icon: <Rows3 size={16}/> },
    { to: '/admin/comments', label: 'Bình luận', icon: <MessageSquare size={16}/> },
    { to: '/admin/notifications', label: 'Thông báo', icon: <Bell size={16}/> },
    { to: '/admin/revenue', label: 'Doanh thu', icon: <ChartPie size={16}/> },
    { to: '/admin/tickets', label: 'Vé & hóa đơn', icon: <Ticket size={16}/> },
    { to: '/admin/staff-reports', label: 'Báo cáo Staff', icon: <ClipboardList size={16}/> },
  ]

  const { logout } = useAuth()
  const nav = useNavigate()

  return (
    <div className="flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
        <Sidebar items={items} />
      </aside>

      {/* Main content */}
      <main className="container-responsive flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-end gap-2 border-b border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900 transition-colors duration-300">
          <DarkToggle />
          <button
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => {
              logout()
              nav('/auth/login')
            }}
          >
            Đăng xuất
          </button>
        </div>

        {/* Page content */}
        <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
