import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../store/auth";
import DarkToggle from "./DarkToggle";
import { ChevronDown, LogOut, User, Clock3 } from "lucide-react";

export default function NavBar() {
  const { role, name, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menu = [
    { to: "/", label: "Trang chủ" },
    { to: "/movies", label: "Phim" },
    { to: "/cinemas", label: "Rạp/Giá vé" },
    { to: "/offers", label: "Ưu đãi" },
    { to: "/support", label: "Hỗ trợ" },
  ];

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

        {/* Mobile hamburger */}
        <button data-testid="hamburger" aria-label="Open menu" onClick={() => setMobileOpen(v=>!v)} className="md:hidden inline-flex items-center justify-center rounded-xl p-2 focus:outline-none">
          <span className="sr-only">Open main menu</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* menu items */}
        <nav className="hidden items-center gap-5 md:flex">
          {menu.map((m) => (
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
          ))}
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
                  src="https://i.pravatar.cc/100?img=12"
                  alt="avatar"
                  className="w-9 h-9 rounded-full border-2 border-sky-500"
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
    
      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t dark:border-gray-800">
          <nav className="mx-auto max-w-7xl p-3 grid gap-2">
            {menu.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'}`
                }
              >
                {m.label}
              </NavLink>
            ))}
            <Link to="/booking/select" onClick={()=>setMobileOpen(false)} className="btn-primary w-full justify-center">
              Mua vé
            </Link>
          </nav>
        </div>
      )}

    </header>
  );
}
