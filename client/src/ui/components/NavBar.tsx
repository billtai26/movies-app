import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../store/auth";
import DarkToggle from "./DarkToggle";
import { ChevronDown, LogOut, User, Clock3 } from "lucide-react";
import { api } from "../../lib/mockApi";

export default function NavBar() {
  const { role, name, avatar, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menu = [
    { to: "/", label: "Trang chủ" },
    // Phim will render a custom dropdown
    { to: "/movies", label: "Phim" },
    { to: "/cinemas", label: "Rạp/Giá vé" },
    { to: "/offers", label: "Ưu đãi" },
    { to: "/support", label: "Hỗ trợ" },
  ];

  const [movieOpen, setMovieOpen] = useState(false);
  const movieRef = useRef<HTMLDivElement>(null);
  const [nowMovies, setNowMovies] = useState<any[]>([]);
  const [comingMovies, setComingMovies] = useState<any[]>([]);

  // fetch movies once
  useEffect(() => {
    let mounted = true;
    api.listMovies('now').then(m => { if(mounted) setNowMovies(m.slice(0,6)) });
    api.listMovies('coming').then(m => { if(mounted) setComingMovies(m.slice(0,6)) });
    return () => { mounted = false };
  }, []);

  // click outside for movies dropdown
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (movieRef.current && !movieRef.current.contains(e.target as Node)) setMovieOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Ẩn menu khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="nav sticky top-0 z-40 w-full border-b dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-3">
        <Link to="/" className="text-2xl font-extrabold" style={{ color: "var(--brand)" }}>
          Cinesta
        </Link>

        {/* menu items */}
        <nav className="hidden items-center gap-5 md:flex">
          {menu.map((m) => {
            if (m.label === 'Phim') {
              return (
                <div key={m.to} className="relative" ref={movieRef}>
                  <button
                    onClick={() => setMovieOpen(!movieOpen)}
                    className={`text-sm inline-flex items-center gap-1 ${movieOpen ? 'font-semibold' : ''}`}
                  >
                    {m.label}
                    <ChevronDown size={14} className={`transition-transform ${movieOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Movies dropdown panel */}
                  {movieOpen && (
                    <div className="absolute left-0 z-50 mt-3 w-[720px] rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
                      <div className="p-4 space-y-4">
                        <div>
                          <h4 className="mb-3 text-sm font-semibold border-l-4 border-sky-500 pl-2">PHIM ĐANG CHIẾU</h4>
                          <div className="flex gap-3 overflow-x-auto pb-2">
                            {nowMovies.map(mv => (
                              <Link key={mv.id} to={`/movies/${mv.id}`} className="min-w-[110px]">
                                <img src={mv.poster} className="w-28 h-40 object-cover rounded-lg" />
                                <div className="text-sm mt-2">{mv.title}</div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="mb-3 text-sm font-semibold border-l-4 border-sky-500 pl-2">PHIM SẮP CHIẾU</h4>
                          <div className="flex gap-3 overflow-x-auto pb-2">
                            {comingMovies.map(mv => (
                              <Link key={mv.id} to={`/movies/${mv.id}`} className="min-w-[110px]">
                                <img src={mv.poster} className="w-28 h-40 object-cover rounded-lg" />
                                <div className="text-sm mt-2">{mv.title}</div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-3 text-right">
                          <Link to="/movies" className="text-sm" style={{ color: 'var(--brand)' }}>Xem tất cả →</Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            }
            return (
              <NavLink
                key={m.to}
                to={m.to}
                className={({ isActive }) =>
                  `text-sm transition-colors duration-200 ${isActive ? "font-semibold" : ""}`
                }
                style={({ isActive }) => ({
                  color: isActive ? "var(--brand)" : "inherit",
                })}
              >
                {m.label}
              </NavLink>
            )
          })}
        </nav>

        {/* bên phải */}
        <div className="flex items-center gap-2">
          <Link to="/booking/select" className="btn-primary hidden md:inline-flex">
            Mua vé
          </Link>
          <DarkToggle />

          {!role ? (
            <>
              <Link to="/auth/login" className="btn-outline">
                Đăng nhập
              </Link>
              <Link to="/auth/register" className="btn-primary">
                Đăng ký
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar */}
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src={avatar || "https://i.pravatar.cc/100?img=12"}
                  alt="avatar"
                  className="w-9 h-9 rounded-full border-2 border-sky-500 avatar-fix"
                />
                <ChevronDown
                  size={16}
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
                  <button
                    onClick={() => {
                      setOpen(false);
                      nav("/profile");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <User size={16} /> Trang cá nhân
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      nav("/tickets");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Clock3 size={16} /> Lịch sử vé
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      nav("/auth/login");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-800/30"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
