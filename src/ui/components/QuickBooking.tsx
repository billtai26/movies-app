import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "./CustomSelect";
import { api } from "../../lib/api";
import AuthModals from "./AuthModals";
import { useAuth } from "../../store/auth";
import { DropdownProvider } from "./DropdownContext";

// Định nghĩa lại Type cho khớp với dữ liệu thật trả về từ MongoDB
type Movie = { _id: string; title: string; };
type Cinema = { _id: string; name: string; };
type Showtime = { _id: string; startTime: string; endTime?: string; };

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
  
  // State lưu dữ liệu từ API
  const [movieRows, setMovieRows] = useState<Movie[]>([]);
  const [cinemaRows, setCinemaRows] = useState<Cinema[]>([]);
  const [showtimeRows, setShowtimeRows] = useState<Showtime[]>([]);

  // State lưu lựa chọn của người dùng
  const [movieId, setMovieId] = useState("");
  const [cinemaId, setCinemaId] = useState("");
  const [date, setDate] = useState("");
  const [showId, setShowId] = useState("");

  // 1. Lấy danh sách Phim và Rạp khi trang vừa load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          api.listMovies({ status: 'now_showing' }), // Chỉ lấy phim đang chiếu
          api.listTheaters()
        ]);

        // Xử lý dữ liệu Phim (Backend trả về { movies: [...] } hoặc mảng trực tiếp)
        const moviesData = (mRes as any)?.movies || mRes || [];
        setMovieRows(Array.isArray(moviesData) ? moviesData : []);

        // Xử lý dữ liệu Rạp (Backend trả về { cinemas: [...] } hoặc mảng trực tiếp)
        const cinemasData = (cRes as any)?.cinemas || cRes || [];
        setCinemaRows(Array.isArray(cinemasData) ? cinemasData : []);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu QuickBooking:", error);
      }
    };

    fetchInitialData();
  }, []);

  // 2. Lấy danh sách Suất chiếu KHI movieId hoặc cinemaId thay đổi
  // Sử dụng hàm listShowtimesByMovie trong backendApi.ts để lấy dữ liệu chính xác hơn
  useEffect(() => {
    // Reset showId và danh sách suất cũ khi đổi phim/rạp
    setShowtimeRows([]);
    setShowId(""); 

    if (movieId && cinemaId) {
      const fetchShowtimes = async () => {
        try {
          // Gọi API thật: lấy suất theo Phim và Rạp
          const sRes = await api.listShowtimesByMovie(movieId, cinemaId);
          const showtimesData = (sRes as any)?.showtimes || sRes || [];
          setShowtimeRows(Array.isArray(showtimesData) ? showtimesData : []);
        } catch (error) {
          console.error("Lỗi lấy suất chiếu:", error);
        }
      };
      fetchShowtimes();
    }
  }, [movieId, cinemaId]);

  // 3. Map dữ liệu Phim cho Dropdown (Chỉ dùng dữ liệu thật)
  const movies = movieRows.map((m) => ({
    value: m._id, // Dùng _id của MongoDB
    label: m.title
  }));

  // 4. Map dữ liệu Rạp cho Dropdown (Chỉ dùng dữ liệu thật)
  const cinemas = cinemaRows.map((c) => ({
    value: c._id,
    label: c.name
  }));

  const dateOptions = next7Days();

  // 5. Lọc và Map dữ liệu Suất chiếu
  const showOptions = useMemo(() => {
    // Phải chọn đủ 3 thông tin mới hiện suất
    if (!movieId || !cinemaId || !date) return [];

    return showtimeRows
      .filter((s) => {
        // Lọc những suất có ngày bắt đầu khớp với ngày đang chọn
        // Lưu ý: startTime từ DB là ISO (UTC), date là YYYY-MM-DD (Local). 
        // startsWith có thể lệch múi giờ, nhưng tạm thời dùng cách này theo code cũ.
        return (s.startTime || "").startsWith(date);
      })
      .map((s) => ({
        value: s._id,
        label: new Date(s.startTime).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          }) +
          (s.endTime
            ? ` – ${new Date(s.endTime).toLocaleTimeString("vi-VN", { 
              hour: "2-digit", 
              minute: "2-digit",
              timeZone: "UTC", 
            })}`
            : ""),
      }));
  }, [showtimeRows, movieId, cinemaId, date]);

  // Xử lý sự kiện mua vé
  const handleLoginSuccess = () => {
    if (!movieId || !cinemaId || !showId) {
      alert("⚠️ Vui lòng chọn đầy đủ thông tin!");
      return;
    }
    nav(`/booking/seats/${showId}`);
  };

  const handleBuy = () => {
    if (!movieId || !cinemaId || !showId) {
      alert("⚠️ Vui lòng chọn đầy đủ thông tin!");
      return;
    }

    const token = useAuth.getState().token;
    if (!token) {
      setLoginOpen(true);
      return;
    }
    
    nav(`/booking/seats/${showId}`);
  };

  const [loginOpen, setLoginOpen] = React.useState(false);
  const canBuy = !!movieId && !!cinemaId && !!date && !!showId;

  return (
    <DropdownProvider>
      <div
        className={
          (
            "bg-white rounded-lg shadow-2xl border border-gray-200 relative z-10 overflow-hidden " +
            (stacked ? "mt-0 " : "-mt-8 lg:-mt-12 ") +
            className
          ).trim()
        }
      >
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
            
            {/* Chọn Suất - Giờ đây phụ thuộc vào kết quả API listShowtimesByMovie */}
            <div className="lg:col-span-1">
              <CustomSelect
                id="showtime-select"
                value={showId}
                leadingLabel="Chọn Suất"
                step={4}
                placeholder={showOptions.length === 0 ? "Không có suất" : "Chọn suất"}
                options={showOptions}
                onChange={setShowId}
              />
            </div>
            
            {/* Nút Mua */}
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
                  <div className={`hidden lg:block absolute -top-3 -bottom-3 left-[-8px] right-[-16px] rounded-r-lg bg-[#f5a667] hover:bg-[#f19d50] text-white shadow-md z-10 ${canBuy ? '' : 'opacity-60 pointer-events-none'}`}>
                    <button
                      className="w-full h-full bg-transparent text-white font-bold text-sm cursor-pointer"
                      onClick={handleBuy}
                    >
                      Mua vé nhanh
                    </button>
                  </div>
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
