/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import Dashboard from './components/Dashboard/Dashboard'
import Home from './pages/Home'
import MovieDetail from './pages/MovieDetail'
import Search from './pages/Search'
import Watchlist from './pages/Watchlist'
import Login from './pages/Login'
import Register from './pages/Register'
import Booking from './pages/Booking'
import BookingConfirmation from './pages/BookingConfirmation'
import BookingHistory from './pages/BookingHistory'
import BookingDetail from './pages/BookingDetail'

export default function App() {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            collapsed={sideBarCollapsed}
            onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              sideBarCollapsed={sideBarCollapsed}
              onToggleSidebar={() => setSideBarCollapsed(!sideBarCollapsed)}
            />

            <main className='flex-1 overflow-y-auto bg-transparent'>
              <div className='p-6 space-y-6'>
                <Routes>
                  <Route path="/login/dashboard" element={<Dashboard />} />
                  {/* Redirect root to dashboard */}
                  <Route path="/" element={<Navigate to="/login/dashboard" />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </div>
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
    </Router>
  )
}

