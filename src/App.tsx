
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import UserLayout from './ui/layouts/UserLayout'
import StaffLayout from './ui/layouts/StaffLayout'
import AdminLayout from './ui/layouts/AdminLayout'
import AuthLayout from './ui/layouts/AuthLayout'
import { RequireAuth } from './router'

import Home from './ui/pages/user/Home'
  import Cinemas from './ui/pages/user/Cinemas'
  import Offers from './ui/pages/user/Offers'
  import Support from './ui/pages/user/Support'
import Blog from './ui/pages/user/Blog'
import Account from './ui/pages/user/Account'
  import BookingSelect from './ui/pages/booking/Select'
  import BookingSeats from './ui/pages/booking/Seats'
  import BookingCombos from './ui/pages/booking/Combos'
  import BookingPayment from './ui/pages/booking/Payment'
  import BookingConfirm from './ui/pages/booking/Confirm'
import Movies from './ui/pages/user/Movies'
import MovieDetail from './ui/pages/user/MovieDetail'
import MovieBlog from './ui/pages/user/MovieBlog'

import Booking from './ui/pages/user/Booking'
import Checkout from './ui/pages/user/Checkout'
import Tickets from './ui/pages/user/Tickets'
import Profile from './ui/pages/user/Profile'
import Reviews from './ui/pages/user/Reviews'
import StaffDashboard from './ui/pages/staff/Dashboard'
import CheckIn from './ui/pages/staff/CheckIn'
import SeatChange from './ui/pages/staff/SeatChange'
import Combos from './ui/pages/staff/Combos'
import Reports from './ui/pages/staff/Reports'
import OrderEdit from './ui/pages/staff/OrderEdit'
import PromoControl from './ui/pages/staff/PromoControl'


import AdminDashboard from './ui/pages/admin/Dashboard'
import AdminMovies from './ui/pages/admin/Movies'
import Genres from './ui/pages/admin/Genres'
import Theaters from './ui/pages/admin/Theaters'
import RoomsSeats from './ui/pages/admin/RoomsSeats'
import Showtimes from './ui/pages/admin/Showtimes'
import Users from './ui/pages/admin/Users'
import Promotions from './ui/pages/admin/Promotions'
import Comments from './ui/pages/admin/Comments'
import Notifications from './ui/pages/admin/Notifications'
import Revenue from './ui/pages/admin/Revenue'
import AdminTickets from './ui/pages/admin/Tickets'
import StaffReports from './ui/pages/admin/StaffReports'
import AdminCombos from './ui/pages/admin/Combos'

import Login from './ui/pages/auth/Login'
import Register from './ui/pages/auth/Register'
import ForgotPassword from './ui/pages/auth/ForgotPassword'
import ResetPassword from './ui/pages/auth/ResetPassword'

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<UserLayout/>}>
        <Route index element={<Home/>} />
          <Route path="cinemas" element={<Cinemas/>} />
          <Route path="offers" element={<Offers/>} />
          <Route path="support" element={<Support/>} />
          <Route path="booking/select" element={<BookingSelect/>} />
          <Route path="booking/seats/:id" element={<BookingSeats/>} />
          <Route path="booking/combos" element={<BookingCombos/>} />
          <Route path="booking/payment" element={<BookingPayment/>} />
          <Route path="booking/confirm" element={<BookingConfirm/>} />
        <Route path="movies" element={<Movies/>} />
        <Route path="movies/:id" element={<MovieDetail/>} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="blogs" element={<Blog />} />
          <Route path="movie-blog" element={<MovieBlog />} />
        <Route path="booking/:showtimeId" element={<Booking/>} />
        <Route path="checkout" element={<Checkout/>} />
        <Route element={<RequireAuth roles={['user']} />}>
          <Route path="tickets" element={<Tickets/>} />
          <Route path="profile" element={<Profile/>} />
          
        </Route>
      </Route>

      <Route path="/staff" element={<RequireAuth roles={['staff']} />}>
        <Route element={<StaffLayout/>}>
          <Route index element={<StaffDashboard/>} />
          <Route path="checkin" element={<CheckIn/>} />
          <Route path="seat-change" element={<SeatChange/>} />
          <Route path="combos" element={<Combos/>} />
          <Route path="reports" element={<Reports/>} />
          <Route path="order-edit" element={<OrderEdit/>} />
          <Route path="promo" element={<PromoControl/>} />
        </Route>
      </Route>

      <Route path="/admin" element={<RequireAuth roles={['admin']} />}>
        <Route element={<AdminLayout/>}>
          <Route index element={<AdminDashboard/>} />
          <Route path="movies" element={<AdminMovies/>} />
          <Route path="genres" element={<Genres/>} />
          <Route path="theaters" element={<Theaters/>} />
          <Route path="rooms-seats" element={<RoomsSeats/>} />
          <Route path="showtimes" element={<Showtimes/>} />
          <Route path="users" element={<Users/>} />
          <Route path="promotions" element={<Promotions/>} />
          <Route path="combos" element={<AdminCombos/>} />
          <Route path="comments" element={<Comments/>} />
          <Route path="notifications" element={<Notifications/>} />
          <Route path="revenue" element={<Revenue/>} />
          <Route path="tickets" element={<AdminTickets/>} />
          <Route path="staff-reports" element={<StaffReports />} />
        </Route>
      </Route>

      <Route path="/auth" element={<AuthLayout/>}>
        <Route path="login" element={<Login/>} />
        <Route path="register" element={<Register/>} />
        <Route path="forgot-password" element={<ForgotPassword/>} />
        <Route path="reset-password" element={<ResetPassword/>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace/>} />
    </Routes>
  )
}
