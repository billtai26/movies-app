import { Routes, Route } from "react-router-dom"
import Home from './pages/Home'
import MovieDetail from "./pages/MovieDetail"
import Search from "./pages/Search"
import Watchlist from "./pages/Watchlist"
import Login from "./pages/Login"
import Register from "./pages/Register"

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
      </Routes>
    </div>
  )
}
