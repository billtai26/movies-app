import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingBreadcrumb from '../../components/BookingBreadcrumb'
import Countdown from '../../components/Countdown'
import LoadingOverlay from '../../components/LoadingOverlay'
import { api } from '../../../lib/backendApi'
import { toast } from 'react-toastify'

interface ComboItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
  items?: string[]; 
}

export default function Combos() {
  const nav = useNavigate();
  const { state } = useLocation() as any;

  const selectedSeats: string[] = state?.selected || [];
  const showtimeId: string = state?.id;

  const [comboItems, setComboItems] = React.useState<ComboItem[]>([]);
  const [qty, setQty] = React.useState<Record<string, number>>(state?.qty || {});

  const [showtime, setShowtime] = React.useState<any>(null);
  const [movie, setMovie] = React.useState<any>(null);
  const [theater, setTheater] = React.useState<any>(null);

  const [loading, setLoading] = React.useState(true);

  // STATE chứa thông tin ghế đã chọn
  const [seatInfo, setSeatInfo] = React.useState({
    singles: 0,
    couples: 0,
    singleIds: [] as string[],
    total: 0
  });

  // [UPDATED] Tính thời gian còn lại khi vào trang này
  const [timeLeft, setTimeLeft] = React.useState(() => {
    const savedEndTime = localStorage.getItem("seat_hold_expiration");
    if (savedEndTime) {
      const diff = Math.floor((parseInt(savedEndTime) - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    }
    return 0; 
  });

  /* ============================
      LOAD COMBOS
  ============================ */
  React.useEffect(() => {
    setLoading(true);
    api.listCombos()
      .then((data: any) => {
        if (data && data.combos) setComboItems(data.combos);
        else if (Array.isArray(data)) setComboItems(data);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ============================
      LOAD SHOWTIME + MOVIE + RẠP + GHẾ
  ============================ */
  React.useEffect(() => {
    if (!showtimeId) return;

    api.getShowtime(showtimeId).then(async (st: any) => {
      setShowtime(st);

      // Load movie
      if (st?.movieId) {
        const m = await api.getMovie(String(st.movieId));
        setMovie(m);
      }

      // Load theater
      const thData = await api.listTheaters();
      let list: any[] = [];

      if (Array.isArray(thData)) list = thData;
      else if (thData && thData.cinemas) list = thData.cinemas;

      const found = list.find((t: any) => String(t._id || t.id) === String(st.theaterId));
      setTheater(found);

      /* ============================
          GHẾ ĐÃ CHỌN — LẤY GIÁ TỪ BACKEND
      ============================ */
      const chosenSeats = st.seats.filter((s: any) =>
        selectedSeats.includes(s.seatNumber)
      );

      const singles = chosenSeats.length;
      const singleIds = chosenSeats.map((s: any) => s.seatNumber);
      const total = chosenSeats.reduce((sum: number, s: any) => sum + s.price, 0);

      setSeatInfo({
        singles,
        couples: 0,
        singleIds,
        total
      });
    });
  }, [showtimeId]);

  /* ============================
      TÍNH TIỀN COMBO
  ============================ */
  const comboTotal = React.useMemo(() => {
    return Object.entries(qty).reduce((sum, [id, n]) => {
      const item = comboItems.find(i => i._id === id);
      return sum + (item?.price || 0) * (n || 0);
    }, 0);
  }, [qty, comboItems]);

  const grandTotal = seatInfo.total + comboTotal;

  /* ============================
      FORMAT NGÀY VIỆT NAM
  ============================ */
  const formatVNDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    
    // SỬA ĐỔI: Dùng getUTC... để lấy giờ gốc từ server, không tự động cộng thêm 7 tiếng
    return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')} - ${
      days[d.getUTCDay()]
    }, ${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
  };

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Đang tải danh sách combo..." />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-3"><BookingBreadcrumb currentStep="combos" /></div>

      {/* ===============================
          LEFT — DANH SÁCH COMBO
      =============================== */}
      <div className="md:col-span-2 card">
        <div className="mb-3 text-xl font-semibold">Chọn Combo / Sản phẩm</div>

        <div className="space-y-3">
          {comboItems.map(cb => (
            <div key={cb._id} className="flex items-center justify-between gap-6 rounded-xl border p-4">
              <div className="flex items-center gap-4">
                <img src={cb.imageUrl} alt={cb.name} className="w-20 h-20 rounded-md object-cover" />

                <div>
                  <div className="text-base font-semibold">{cb.name}</div>
                  <div className="text-sm text-gray-600">{cb.description || (cb.items?.join(', '))}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-28 text-right font-medium">{cb.price.toLocaleString()} đ</span>

                <div className="flex items-center gap-3">
                  <button
                    className="btn-outline px-3"
                    onClick={() => setQty(prev => ({ ...prev, [cb._id]: Math.max(0, (prev[cb._id] || 0) - 1) }))}
                  >-</button>

                  <span className="min-w-6 text-center font-semibold">{qty[cb._id] || 0}</span>

                  <button
                    className="btn-outline px-3"
                    onClick={() => setQty(prev => ({ ...prev, [cb._id]: (prev[cb._id] || 0) + 1 }))}
                  >+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===============================
          RIGHT — TÓM TẮT
      =============================== */}
      <div className="space-y-4">
        <div className="card p-5 space-y-4">

          {/* TIMER */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Thời gian giữ ghế:</div>
            {/* [UPDATED] Truyền timeLeft đã tính toán vào đây */}
            <Countdown 
              secondsLeft={timeLeft} 
              onExpire={() => {
                toast.info("Hết thời gian giữ ghế!");
                localStorage.removeItem("seat_hold_expiration");
                nav("/movies");
              }}
            />
          </div>

          {/* MOVIE INFO */}
          <div className="flex gap-4">
            {movie?.poster && (
              <img src={movie.poster} className="w-32 h-48 rounded-md object-cover" />
            )}

            <div>
              <div className="text-xl font-semibold">{movie?.title}</div>
            </div>
          </div>

          <div>
            <div className="opacity-80">{theater?.name}</div>
            <div className="opacity-80">Suất: {formatVNDate(showtime?.startTime)}</div>
          </div>

          <hr className="border-dashed" />

          {/* GHẾ ĐÃ CHỌN */}
          <div>
            {seatInfo.singles > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <span>{seatInfo.singles}x Ghế đơn</span>
                  <b className="text-lg">{seatInfo.total.toLocaleString()} đ</b>
                </div>

                <div className="text-xs opacity-80">Ghế: {seatInfo.singleIds.join(', ')}</div>
              </>
            ) : (
              <div className="text-xs opacity-60">Ghế: Chưa chọn</div>
            )}
          </div>

          <hr className="border-dashed" />

          {/* COMBO CHI TIẾT */}
          {Object.entries(qty).filter(([_, n]) => n > 0).map(([id, n]) => {
            const cb = comboItems.find(i => i._id === id);
            const subtotal = (cb?.price || 0) * n;

            return (
              <div key={id} className="flex items-center justify-between">
                <span>{n}x {cb?.name}</span>
                <b>{subtotal.toLocaleString()} đ</b>
              </div>
            );
          })}

          <hr className="border-dashed" />

          {/* TỔNG CỘNG */}
          <div className="flex items-center justify-between text-xl font-bold">
            <span>Tổng cộng</span>
            <b className="text-2xl text-orange-600">{grandTotal.toLocaleString()} đ</b>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-between">
          <button
            className="btn-back"
            onClick={() => nav(`/booking/seats/${showtimeId}`, { state: { selected: selectedSeats } })}
          >
            Quay lại
          </button>

          <button
            className="btn-next"
            onClick={() =>
              nav('/booking/payment', {
              state: { 
                ...state, 
                qty, 
                selected: selectedSeats, 
                comboTotal, 
                ticketTotal: seatInfo.total,
                grandTotal: seatInfo.total + comboTotal  // 🔥 THÊM DÒNG NÀY
              }
            })
            }
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  )
}
