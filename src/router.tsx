import React from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './store/auth'

// Layouts
import UserLayout from './ui/layouts/UserLayout'
import StaffLayout from './ui/layouts/StaffLayout'
import AdminLayout from './ui/layouts/AdminLayout'
import AuthLayout from './ui/layouts/AuthLayout'

// User Pages
import Home from './ui/pages/user/Home'
import Movies from './ui/pages/user/Movies'
import MovieDetail from './ui/pages/user/MovieDetail'
import Booking from './ui/pages/user/Booking'
import Profile from './ui/pages/user/Profile'

// Staff Pages
import StaffDashboard from './ui/pages/staff/Dashboard'
import StaffCheckIn from './ui/pages/staff/CheckIn'
import StaffBooking from './ui/pages/staff/StaffBooking'
import StaffSeatChange from './ui/pages/staff/SeatChange'
import StaffCombos from './ui/pages/staff/Combos'
import StaffReports from './ui/pages/staff/Reports'
import StaffOrderEdit from './ui/pages/staff/OrderEdit'
import StaffPromoControl from './ui/pages/staff/PromoControl'

// Admin Pages
import AdminDashboard from './ui/pages/admin/Dashboard'
import AdminMovies from './ui/pages/admin/Movies'
import AdminPromotions from './ui/pages/admin/Promotions' 
import AdminUsers from './ui/pages/admin/Users'           // Ví dụ thêm Users
import AdminTheaters from './ui/pages/admin/Theaters'

// Auth Pages
import Login from './ui/pages/auth/Login'
import Register from './ui/pages/auth/Register'
import ForgotPassword from './ui/pages/auth/ForgotPassword'
import ResetPassword from './ui/pages/auth/ResetPassword'
import AdminCombos from './ui/pages/admin/Combos'

// --- COMPONENT BẢO VỆ ROUTE ---
export const RequireAuth: React.FC<{ roles?: ('user' | 'staff' | 'admin')[] }> = ({ roles }) => {
  const { token, role } = useAuth()
  
  // 1. Chưa đăng nhập -> Login
  if (!token) {
    return <Navigate to="/auth/login" replace />
  }

  // 2. Đã đăng nhập nhưng sai quyền -> Về trang chủ
  if (roles && role && !roles.includes(role)) {
    // Nếu là staff cố vào admin -> về staff dashboard
    if (role === 'staff') return <Navigate to="/staff" replace />
    return <Navigate to="/" replace />
  }

  // 3. Hợp lệ -> Render
  return <Outlet />
}

// --- CẤU HÌNH ROUTER ---
export const router = createBrowserRouter([
  // 1. Public / User Routes
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "movies", element: <Movies /> },
      { path: "movie/:id", element: <MovieDetail /> },
      // Route cần đăng nhập của User
      {
        element: <RequireAuth roles={['user', 'staff', 'admin']} />,
        children: [
          { path: "booking/:id", element: <Booking /> },
          { path: "profile", element: <Profile /> },
        ]
      }
    ]
  },

  // 2. Staff Routes (Chỉ Staff & Admin)
  {
    path: "/staff",
    // QUAN TRỌNG: Cấu hình roles tại đây
    element: <RequireAuth roles={['staff', 'admin']} />,
    children: [
      {
        element: <StaffLayout />,
        children: [
          { index: true, element: <StaffDashboard /> },
          { path: "checkin", element: <StaffCheckIn /> },
          { path: "booking", element: <StaffBooking /> },
          { path: "seat-change", element: <StaffSeatChange /> },
          { path: "combos", element: <StaffCombos /> },
          { path: "reports", element: <StaffReports /> },
          { path: "order-edit", element: <StaffOrderEdit /> },
          { path: "promo", element: <StaffPromoControl /> },
        ]
      }
    ]
  },

  // 3. Admin Routes (Chỉ Admin)
  {
    path: "/admin",
    element: <RequireAuth roles={['admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "movies", element: <AdminMovies /> },
          
          // 2. THÊM DÒNG NÀY: Đăng ký route cho trang Khuyến mãi
          { path: "promotions", element: <AdminPromotions /> },
          
          // Bạn nên thêm luôn các route khác tương ứng với file đã tạo trong folder admin:
          { path: "users", element: <AdminUsers /> },
          { path: "theaters", element: <AdminTheaters /> },
          // { path: "showtimes", element: <AdminShowtimes /> },
          // { path: "tickets", element: <AdminTickets /> },
          { path: "combos", element: <AdminCombos /> },
        ]
      }
    ]
  },

  // 4. Auth Routes
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
    ]
  },

  // Fallback 404
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
])
