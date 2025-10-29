import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User, Clock3 } from "lucide-react";
import { useAuth } from "../../store/auth";
import DarkToggle from "./DarkToggle";

export default function NavBar() {
  const { role, name, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menu = [
    { to: "/movies", label: "Phim" },
    { to: "/offers", label: "Star Shop" },
    { to: "/blog", label: "Góc Điện Ảnh" },
    { to: "/offers", label: "Sự Kiện" },
    { to: "/cinemas", label: "Rạp/Giá Vé" },
  ];

  // Đóng dropdown khi click ngoài
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
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-onlycinema.png" alt="Only Cinema" className="h-9 w-auto" />
        </Link>

        {/* MENU CHÍNH */}
        <nav className="hidden lg:flex items-center gap-6 font-medium text-sm text-gray-800">
          <Link
            to="/booking/select"
            className="bg-[#f58a1f] text-white px-4 py-2 rounded-r-lg font-semibold flex items-center"
            style={{
              clipPath: "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)",
            }}
          >
            ⭐ Mua Vé
          </Link>

          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              className={({ isActive }) =>
                `flex items-center gap-1 transition ${
                  isActive ? "text-[#f58a1f]" : "text-gray-800 hover:text-[#f58a1f]"
                }`
              }
            >
              {m.label}
              <ChevronDown size={14} className="text-gray-400 mt-[1px]" />
            </NavLink>
          ))}
        </nav>

        {/* PHẦN BÊN PHẢI */}
        <div className="flex items-center gap-4">
          <DarkToggle />

          {!role ? (
            <>
              <Link to="/auth/login" className="text-gray-700 hover:text-[#f58a1f] text-sm">
                Đăng Nhập
              </Link>
              <Link
                to="/auth/register"
                className="flex items-center gap-1 text-[#007bff] text-sm font-semibold hover:underline"
              >
                <span>THAM GIA</span>
                <span className="text-[#f58a1f] font-bold">OL-STAR</span>
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src="https://i.pravatar.cc/100?img=12"
                  alt="avatar"
                  className="w-9 h-9 rounded-full border-2 border-[#f58a1f]"
                />
                <ChevronDown
                  size={16}
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden animate-fadeIn">
                  <button
                    onClick={() => {
                      setOpen(false);
                      nav("/profile");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <User size={16} /> Trang cá nhân
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      nav("/tickets");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Clock3 size={16} /> Lịch sử vé
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      nav("/auth/login");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nút menu mobile */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* MENU MOBILE */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <nav className="flex flex-col p-3 space-y-2 text-sm font-medium">
            <Link
              to="/booking/select"
              onClick={() => setMobileOpen(false)}
              className="bg-[#f58a1f] text-white px-3 py-2 rounded-md text-center"
            >
              Mua Vé
            </Link>
            {menu.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md ${
                    isActive ? "text-[#f58a1f] font-semibold" : "hover:bg-gray-50"
                  }`
                }
              >
                {m.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
