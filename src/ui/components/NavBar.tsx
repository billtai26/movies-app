import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User, Clock3, Search } from "lucide-react";
import { useAuth } from "../../store/auth";
// import DarkToggle from "./DarkToggle";
import HoverDropdown from "./HoverDropdown";
import MovieDropdown from "./MovieDropdown";
import AuthModals from "./AuthModals";
import { useCollection } from "../../lib/mockCrud";

// ----- Navbar Chính -----
export default function NavBar() {
  const { token, role, logout, avatar } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { rows: movies = [] } = useCollection<any>("movies");
  const { rows: theaters = [] } = useCollection<any>("theaters");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
        setShowSearchInput(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dropdown items cho menu Phim
  const movieDropdownItems = [
    { label: "Phim Đang Chiếu", to: "/movies?tab=now", description: "Xem các phim đang chiếu tại rạp" },
    { label: "Phim Sắp Chiếu", to: "/movies?tab=coming", description: "Khám phá phim sắp ra mắt" },
    { label: "Phim IMAX", to: "/movies?tab=imax", description: "Trải nghiệm điện ảnh đỉnh cao" },
    { label: "Tất Cả Phim", to: "/movies", description: "Xem toàn bộ danh sách phim" },
  ];

  // Dropdown items cho Star Shop
  const starShopDropdownItems = [
    { label: "Khuyến Mãi", to: "/offers", description: "Ưu đãi và giảm giá đặc biệt" },
    { label: "Sản Phẩm", to: "/products", description: "Combo bắp nước và quà tặng" },
    { label: "Thẻ Thành Viên", to: "/membership", description: "Đăng ký thẻ OL-STAR" },
  ];

  // Dropdown items cho Góc Điện Ảnh
  const blogDropdownItems = [
    { label: "Thể Loại Phim", to: "/blog/genres" },
    { label: "Diễn Viên", to: "/blog/actors" },
    { label: "Đạo Diễn", to: "/blog/directors" },
    { label: "Bình Luận Phim", to: "/reviews" },
    { label: "Blog Điện Ảnh", to: "/movie-blog" },
  ];

  // Dropdown items cho Sự Kiện (kiểu đơn giản giống mẫu)
  const eventsDropdownItems = [
    { label: "Ưu Đãi", to: "/offers" },
    { label: "Phim Hay Tháng", to: "/events/monthly" },
  ];

  // Dropdown items cho Rạp/Giá Vé
  // Dropdown rạp: danh sách rạp cuộn dài giống Galaxy
  // Lấy danh sách rạp từ collection của ứng dụng
  const cinemasDropdownItems = (
    theaters.length > 0
      ? theaters.map((t: any) => ({ label: t.name, to: `/cinemas?theater=${t.id}` }))
      : [
          { label: "Danh Sách Rạp", to: "/cinemas" },
        ]
  );

  // Logic tìm kiếm phim
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5); // Chỉ hiển thị tối đa 5 kết quả

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
  };

  const handleMovieClick = (movieId: string) => {
    setSearchQuery("");
    setShowSearchResults(false);
    setShowSearchInput(false);
    nav(`/movies/${movieId}`);
  };

  const handleSearchIconClick = () => {
    setShowSearchInput(true);
  };

  return (
    <>
      <header className="bg-white -mb-px relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="https://res.cloudinary.com/dyxvjfily/image/upload/v1762854706/Colorful_Retro_Illustrative_Tasty_Popcorn_Logo_qsnmkf.png." alt="Only Cinema" className="h-12 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 font-semibold text-base text-gray-800">
            <Link
              to="/booking/select"
              className="bg-[#f58a1f] text-white px-6 py-2.5 rounded-r-xl font-semibold flex items-center"
              style={{
                clipPath: "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)",
              }}
            >
              ⭐ Mua Vé
            </Link>
            
            {/* Phim - Sử dụng MovieDropdown */}
            <MovieDropdown label="Phim" />
            
            {/* Hover Dropdown cho Star Shop */}
            <HoverDropdown 
              label="Star Shop" 
              items={starShopDropdownItems}
            />
            
            {/* Hover Dropdown cho Góc Điện Ảnh (kiểu đơn giản, giống mẫu) */}
            <HoverDropdown 
              label="Góc Điện Ảnh" 
              items={blogDropdownItems}
              variant="simple"
            />
            
            {/* Hover Dropdown cho Sự Kiện (simple) */}
            <HoverDropdown 
              label="Sự Kiện" 
              items={eventsDropdownItems}
              variant="simple"
            />
            
            {/* Hover Dropdown cho Rạp/Giá Vé */}
            <HoverDropdown 
              label="Rạp/Giá Vé" 
              items={cinemasDropdownItems}
            />
          </nav>

          <div className="flex items-center gap-5">
            {/* Search Box */}
            <div className="relative" ref={searchRef}>
              {!showSearchInput ? (
                // Chỉ hiển thị icon khi chưa click
                <button
                  onClick={handleSearchIconClick}
                  className="p-2 text-gray-600 hover:text-[#f58a1f] transition-colors"
                >
                  <Search size={20} />
                </button>
              ) : (
                // Hiển thị input khi đã click vào icon
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm phim..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoFocus
                    className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f58a1f] focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
              )}
              
              {/* Search Results Dropdown */}
              {showSearchInput && showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {filteredMovies.length > 0 ? (
                    <>
                      {filteredMovies.map((movie) => (
                        <button
                          key={movie.id}
                          onClick={() => handleMovieClick(movie.id)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 flex items-center gap-3"
                        >
                          <img
                            src={movie.poster || "/placeholder-movie.jpg"}
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{movie.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}
                            </div>
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setShowSearchResults(false);
                          setShowSearchInput(false);
                          nav(`/movies?search=${encodeURIComponent(searchQuery)}`);
                        }}
                        className="w-full px-4 py-2 text-center text-[#f58a1f] hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                      >
                        Xem tất cả kết quả cho "{searchQuery}"
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                      Không tìm thấy phim nào
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* <DarkToggle /> */},

            {!token ? (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-gray-700 hover:text-[#f58a1f] text-sm"
                >
                  Đăng Nhập
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="text-[#f26b38] text-sm font-semibold hover:underline"
                >
                  THAM GIA <span className="text-[#f58a1f] font-bold">OL-STAR</span>
                </button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setOpen(!open)} className="flex items-center gap-2">
                  <img
                    src={avatar || "https://i.pravatar.cc/100?img=12"}
                    alt="avatar"
                    className="w-9 h-9 rounded-full border-2 border-[#f58a1f]"
                  />
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>

                {open && (
                  <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden animate-fadeIn z-50">
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
                        nav("/");
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
        </div>
      </header>

      {/* Popup */}
      <AuthModals
        loginOpen={showLogin}
        onLoginClose={() => setShowLogin(false)}
        onLoginSuccess={() => {
          setShowLogin(false);
          window.location.reload();
        }}
      />
    </>
  );
}
