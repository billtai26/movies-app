import React, { useState } from 'react'
import { ClipboardList, Menu } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import DarkToggle from '../components/DarkToggle'
import { useAuth } from '../../store/auth'
import {
  LayoutDashboard, Clapperboard, Shapes, Building2, Rows3,
  CalendarClock, Users, Percent, MessageSquare, Bell, ChartPie, Ticket
} from 'lucide-react'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const nav = useNavigate()

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

  return (
    <div className="flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 transform bg-white dark:bg-gray-900 
                    border-r border-gray-200 dark:border-gray-800 shadow-sm 
                    transition-transform duration-300 ease-in-out 
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <Sidebar items={items} />
      </aside>

      {/* Overlay cho mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 
                        p-3 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="flex items-center gap-2">
            {/* Nút menu mobile */}
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <span className="font-semibold text-gray-800 dark:text-gray-100 hidden sm:inline">Only Cinema Panel</span>
          </div>

          <div className="flex items-center gap-3">
            <DarkToggle />
            <button
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => {
                logout()
                nav('/auth/login')
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 p-4 sm:p-6 overflow-x-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
