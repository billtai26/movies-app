import { Routes, Route } from "react-router-dom"
import Home from './pages/Home'
import MovieDetail from "./pages/MovieDetail"
import Search from "./pages/Search"
import Watchlist from "./pages/Watchlist"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Booking from "./pages/Booking"
import BookingConfirmation from "./pages/BookingConfirmation"
import BookingHistory from "./pages/BookingHistory"
import BookingDetail from "./pages/BookingDetail"

export default function App() {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking/:movieId" element={<Booking />} />
        <Route path="/booking/confirmation" element={<BookingConfirmation />} />
        <Route path="/bookings" element={<BookingHistory />} />
        <Route path="/bookings/:id" element={<BookingDetail />} />
      </Routes>
    </div>
  )
}
