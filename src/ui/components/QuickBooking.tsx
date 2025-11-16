import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "./CustomSelect";
import { api } from "../../lib/api";
import AuthModals from "./AuthModals";
import { useAuth } from "../../store/auth";
import { DropdownProvider } from "./DropdownContext";

type Movie = { _id?: string; id?: string | number; title?: string; name?: string; poster?: string };
type Cinema = { _id?: string; id?: string | number; name: string; city?: string };
type Showtime = { _id?: string; id?: string | number; movieId: string; theaterId?: string; cinemaId?: string; startTime?: string; time?: string; end?: string };

function next7Days() {
  const list: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const value = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
    list.push({ value, label });
  }
  return list;
}

type Props = {
  stacked?: boolean;
  className?: string;
};

export default function QuickBooking({ stacked = false, className = "" }: Props) {
  const nav = useNavigate();
  const [movieRows, setMovieRows] = React.useState<Movie[]>([]);
  const [cinemaRows, setCinemaRows] = React.useState<Cinema[]>([]);
  const [showtimeRows, setShowtimeRows] = React.useState<Showtime[]>([]);
  React.useEffect(() => {
    Promise.allSettled([
      api.listMovies({ status: 'now_showing' }),
      api.listTheaters(),
      api.listShowtimes()
    ]).then(([mRes, cRes, sRes]) => {
      if (mRes.status === 'fulfilled') {
        const arr = (mRes.value as any)?.movies || mRes.value || [];
        setMovieRows(arr as Movie[]);
      }
      if (cRes.status === 'fulfilled') {
        setCinemaRows(cRes.value as Cinema[]);
      }
      if (sRes.status === 'fulfilled') {
        setShowtimeRows(sRes.value as Showtime[]);
      }
    });
  }, []);

  const movies = (movieRows.length
    ? movieRows
    : [
        { id: 1, title: "Nhà Ma Xó" },
        { id: 2, title: "Cục Vàng Của Ngoại" },
        { id: 3, title: "Cái Mả" },
        { id: 4, title: "Trà Chối Mes" },
        { id: 5, title: "Good Boy" },
        { id: 6, title: "Kẻ Truy Sát" },
        { id: 7, title: "Người Hùng Bóng Đêm" },
        { id: 8, title: "Phim Shin Cậu Bé Bút Chì: Nóng Bỏng Tay! Những Vũ Công Siêu Cay Kasukabe" },
        { id: 9, title: "Bốn Đường Môn Lớn: Thử Thách Cực Hạn" },
        { id: 10, title: "Kẻ Dòng Thế" },
        { id: 11, title: "Cửu Long Thành Trại: Vây Thành" },
        { id: 12, title: "Cléo Từ 5 Đến 7" },
        { id: 13, title: "Mục Sư, Thầy Đồng Và Con Quỷ Ám Trí" },
        { id: 14, title: "Bịt Mắt Bắt Nai" },
      ]
  ).map((m) => ({ value: String((m as any)._id ?? m.id), label: String(m.title ?? (m as any).name ?? '') }));

  const cinemas = (cinemaRows.length
    ? cinemaRows
    : [
        { id: 1, name: "Only Cinema Quận 1" },
        { id: 2, name: "Only Cinema Tân Bình" },
        { id: 3, name: "CGV Vincom Center" },
        { id: 4, name: "Only Cinema Nguyễn Du" },
        { id: 5, name: "Lotte Cinema Diamond Plaza" },
        { id: 6, name: "BHD Star Cineplex" },
        { id: 7, name: "Mega GS Cinemas" },
        { id: 8, name: "Cinestar Hai Bà Trưng" },
        { id: 9, name: "Beta Cinemas Thảo Điền" },
        { id: 10, name: "Platinum Cineplex" },
      ]
  ).map((c) => ({ value: String((c as any)._id ?? c.id), label: c.name }));

  const [movieId, setMovieId] = useState("");
  const [cinemaId, setCinemaId] = useState("");
  const [date, setDate] = useState("");
  const [showId, setShowId] = useState("");

  const dateOptions = next7Days();

  const showOptions = useMemo(() => {
    // Chỉ hiển thị danh sách suất khi đã chọn đủ movie, cinema, date
    if (!movieId || !cinemaId || !date) return [];

    const base = showtimeRows.length ? showtimeRows : [];

    const filtered = base
      .filter((s) => {
        const startIso = (s as any).start ?? s.startTime ?? '';
        const theater = s.cinemaId ?? s.theaterId ?? '';
        return String(s.movieId) === movieId && String(theater) === cinemaId && startIso.startsWith(date);
      })
      .map((s) => ({
        value: String((s as any)._id ?? s.id),
        label:
          new Date(((s as any).start ?? s.startTime)!).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }) +
          (s.end
            ? ` – ${new Date(s.end).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
            : ""),
      }));

    // Nếu không có dữ liệu thực, hiển thị các giờ chuẩn để demo
    if (filtered.length === 0) {
      const standardTimes = ["11:15", "13:00", "14:45", "16:30", "18:15", "20:00", "22:00"];
      return standardTimes.map((t, idx) => ({ value: `fallback-${date}-${idx}`, label: t }));
    }

    return filtered;
  }, [showtimeRows, movieId, cinemaId, date]);

  const handleLoginSuccess = () => {
    // Sau khi đăng nhập thành công, tiếp tục với flow mua vé
    if (!movieId || !cinemaId || !showId) {
      alert("⚠️ Vui lòng chọn đầy đủ thông tin!");
      return;
    }

    // Luôn điều hướng vào trang chọn ghế
    const realShow = showtimeRows.find((s:any) => String((s?._id ?? s?.id)) === String(showId));
    const targetShowId = realShow ? showId : String(showId);
    
    nav(`/booking/seats/${targetShowId}`);
  };

  const handleBuy = () => {
    if (!movieId || !cinemaId || !showId) {
      alert("⚠️ Vui lòng chọn đầy đủ thông tin!");
      return;
    }

    // if not logged in, open login modal
    const token = useAuth.getState().token
    if (!token) {
      setLoginOpen(true)
      return
    }

    // Luôn điều hướng vào trang chọn ghế
    // Nếu showId là thật thì dùng, không thì dùng một ID mặc định
    const realShow = showtimeRows.find((s:any) => String((s?._id ?? s?.id)) === String(showId));
    const targetShowId = realShow ? showId : String(showId);
    
    nav(`/booking/seats/${targetShowId}`);
  };

  const [loginOpen, setLoginOpen] = React.useState(false)
  const canBuy = !!movieId && !!cinemaId && !!date && !!showId;

  return (
    <DropdownProvider>
      {/* Thanh mua vé nhanh: có thể hiển thị ngang (mặc định) hoặc dọc (stacked) */}
      <div
        className={
          (
            "bg-white rounded-lg shadow-2xl border border-gray-200 relative z-10 overflow-hidden " +
            (stacked ? "mt-0 " : "-mt-8 lg:-mt-12 ") +
            className
          ).trim()
        }
      >
        {/* Form */}
        <div className="px-4 py-3">
          <div className={stacked ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 lg:grid-cols-5 gap-2 items-stretch"}>
            {/* Chọn Phim */}
            <div className="lg:col-span-1">
              <CustomSelect
                id="movie-select"
                value={movieId}
                leadingLabel="Chọn Phim"
                step={1}
                placeholder="Chọn phim"
                options={movies}
                onChange={setMovieId}
              />
            </div>
            
            {/* Chọn Rạp */}
            <div className="lg:col-span-1">
              <CustomSelect
                id="cinema-select"
                value={cinemaId}
                leadingLabel="Chọn Rạp"
                step={2}
                placeholder="Chọn rạp"
                options={cinemas}
                onChange={setCinemaId}
              />
            </div>
            
            {/* Chọn Ngày */}
            <div className="lg:col-span-1">
              <CustomSelect
                id="date-select"
                value={date}
                leadingLabel="Chọn Ngày"
                step={3}
                placeholder="Chọn ngày"
                options={dateOptions}
                onChange={setDate}
              />
            </div>
            
            {/* Chọn Suất */}
            <div className="lg:col-span-1">
              <CustomSelect
                id="showtime-select"
                value={showId}
                leadingLabel="Chọn Suất"
                step={4}
                placeholder="Chọn suất"
                options={showOptions}
                onChange={setShowId}
              />
            </div>
            
            {/* Ô Mua Vé Nhanh */}
            <div className={stacked ? "relative" : "lg:col-span-1 relative"}>
              {stacked ? (
                <div className="w-full h-11 rounded-lg bg-[#f5a667] hover:bg-[#f19d50] text-white shadow-md">
                  <button
                    className="w-full h-full bg-transparent text-white font-bold text-sm cursor-pointer disabled:opacity-60"
                    disabled={!canBuy}
                    onClick={handleBuy}
                  >
                    Mua vé nhanh
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop: phủ full chiều cao nội dung thanh trắng (kể cả padding) */}
                  <div className={`hidden lg:block absolute -top-3 -bottom-3 left-[-8px] right-[-16px] rounded-r-lg bg-[#f5a667] hover:bg-[#f19d50] text-white shadow-md z-10 ${canBuy ? '' : 'opacity-60 pointer-events-none'}`}>
                    <button
                      className="w-full h-full bg-transparent text-white font-bold text-sm cursor-pointer"
                      onClick={handleBuy}
                    >
                      Mua vé nhanh
                    </button>
                  </div>
                  {/* Mobile/Tablet: giữ nút bình thường */}
                  <div className="lg:hidden w-full h-11 rounded-lg bg-[#f5a667] hover:bg-[#f19d50] text-white shadow-md">
                    <button
                      className="w-full h-full bg-transparent text-white font-bold text-sm cursor-pointer disabled:opacity-60"
                      disabled={!canBuy}
                      onClick={handleBuy}
                    >
                      Mua vé nhanh
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <AuthModals 
          loginOpen={loginOpen} 
          onLoginClose={() => setLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    </DropdownProvider>
  );
}
