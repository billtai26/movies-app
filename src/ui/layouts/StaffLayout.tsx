
import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import DarkToggle from '../components/DarkToggle'
import { useAuth } from '../../store/auth'
import { ClipboardCheck, Ticket, RefreshCw, Utensils, FileWarning, Edit3, Percent } from 'lucide-react'

export default function StaffLayout(){
  const items = [
    { to: '/staff', label: 'Tổng quan', icon: <ClipboardCheck size={16}/> },
    { to: '/staff/checkin', label: 'Check-in vé', icon: <Ticket size={16}/> },
    { to: '/staff/seat-change', label: 'Đổi ghế tại quầy', icon: <RefreshCw size={16}/> },
    { to: '/staff/combos', label: 'Xử lý combo', icon: <Utensils size={16}/> },
    { to: '/staff/reports', label: 'Báo cáo sự cố', icon: <FileWarning size={16}/> },
    { to: '/staff/order-edit', label: 'Sửa đơn hàng', icon: <Edit3 size={16}/> },
    { to: '/staff/promo', label: 'Ưu đãi tại rạp', icon: <Percent size={16}/> },
  ]
  const { logout } = useAuth()
  const nav = useNavigate()
  return (
    <div className="flex">
      <Sidebar items={items}/>
      <main className="container-responsive flex-1">
        <div className="flex items-center justify-end gap-2 border-b p-3 dark:border-gray-800">
          <DarkToggle/>
          <button className="btn-outline" onClick={()=>{ logout(); nav('/auth/login') }}>Đăng xuất</button>
        </div>
        <div className="p-6">
          <Outlet/>
        </div>
      </main>
    </div>
  )
}
