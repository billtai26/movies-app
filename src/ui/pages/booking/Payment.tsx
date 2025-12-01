import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookingBreadcrumb from "../../components/BookingBreadcrumb";
import { api } from "../../../lib/backendApi";

interface LocationState {
  id: string;
  selected: string[];
  ticketTotal: number;
  comboTotal: number;
  grandTotal?: number;
  qty?: Record<string, number>;
}

export default function Payment() {
  const nav = useNavigate();
  const location = useLocation() as { state: LocationState | null };
  const state = location.state;

  // Nếu F5 / vào thẳng không có state -> đẩy về home
  useEffect(() => {
    if (!state?.id) {
      nav("/", { replace: true });
    }
  }, [state, nav]);

  if (!state?.id) return null;

  // --- DATA TRUYỀN TỪ COMBOS ---
  const showtimeId = state.id;
  const selectedSeats = state.selected || [];
  const ticketTotal = state.ticketTotal || 0;
  const comboTotal = state.comboTotal || 0;
  const qty = state.qty || {};

  // Tự tính lại tổng tiền cho chắc cú
  const totalMoney = ticketTotal + comboTotal;

  // --- STATE LOAD THÔNG TIN ---
  const [show, setShow] = useState<any>(null);
  const [movie, setMovie] = useState<any>(null);
  const [theater, setTheater] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------
  // LOAD THÔNG TIN SUẤT CHIẾU + PHIM + RẠP + PHÒNG
  // ---------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // 1. Lấy suất chiếu
        const s = await api.getShowtime(showtimeId);
        if (!mounted) return;
        setShow(s);

        // 2. Lấy movie, danh sách rạp, phòng chiếu
        const [m, theaterRes, roomRes] = await Promise.all([
          api.getMovie(String(s.movieId)),
          api.listTheaters(),
          api.listRooms(),
        ]);

        if (!mounted) return;

        setMovie(m);

        // Chuẩn hóa list rạp
        let theaterList: any[] = [];
        if (Array.isArray(theaterRes)) theaterList = theaterRes;
        else if (theaterRes && theaterRes.cinemas) theaterList = theaterRes.cinemas;

        const theaterFound = theaterList.find(
          (t: any) => String(t._id || t.id) === String(s.theaterId)
        );
        setTheater(theaterFound);

        // Chuẩn hóa list phòng
        let roomList: any[] = [];
        if (Array.isArray(roomRes)) roomList = roomRes;
        else if (roomRes && (roomRes.rooms || roomRes.cinemaHalls)) {
          roomList = roomRes.rooms || roomRes.cinemaHalls;
        }

        const roomFound = roomList.find(
          (r: any) => String(r._id || r.id) === String(s.roomId)
        );
        setRoom(roomFound);
      } catch (error) {
        console.error("Lỗi load dữ liệu Payment:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showtimeId]);

  // ---------------------------------------------------------
  // FORMAT NGÀY THÁNG
  // ---------------------------------------------------------
  const formatVNDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const days = [
      "Chủ nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")} - ${days[d.getDay()]}, ${String(
      d.getDate()
    ).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}/${d.getFullYear()}`;
  };

  // ---------------------------------------------------------
  // THANH TOÁN MOMO QR THẬT
  // ---------------------------------------------------------
  const payWithMomo = async () => {
    try {
      const body = {
        showtimeId,
        movieId: show?.movieId,
        seats: selectedSeats,    // ['A1', 'A2', ...]
        combos: qty,             // { comboId: quantity }
        amount: totalMoney,
        orderInfo: `Booking vé xem phim - ${movie?.title || ""}`,
      };

      const result = await api.momoCreate(body);
      console.log("MoMo init result:", result);

      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        alert("Không tạo được giao dịch MoMo.");
      }
    } catch (err: any) {
      console.error("MoMo error:", err?.response?.data || err);
      if (err?.response?.status === 401) {
        alert("Bạn cần đăng nhập để thanh toán.");
      } else {
        alert("Lỗi tạo thanh toán MoMo.");
      }
    }
  };

  // ---------------------------------------------------------
  // GIAO DIỆN
  // ---------------------------------------------------------
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-3">
        <BookingBreadcrumb currentStep="payment" />
      </div>

      {/* Cột trái */}
      <div className="md:col-span-2 space-y-4">
        <div className="card p-4 space-y-3">
          <div className="text-xl font-semibold">Phương thức thanh toán</div>

          <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer">
            <input type="radio" checked readOnly />
            <img
              src="https://developers.momo.vn/images/logo-momo.svg"
              alt="MoMo"
              className="w-12"
            />
            <span className="font-medium">Thanh toán MoMo (QR)</span>
          </label>

          {loading && (
            <div className="text-sm text-gray-500">
              Đang tải thông tin suất chiếu...
            </div>
          )}
        </div>
      </div>

      {/* Cột phải */}
      <div className="space-y-4">
        <div className="card p-5 space-y-4">
          {/* Thông tin phim */}
          <div className="flex gap-4">
            {movie?.poster && (
              <img
                src={movie.poster}
                alt="poster"
                className="w-28 h-40 rounded-lg object-cover"
              />
            )}
            <div>
              <div className="text-xl font-semibold">
                {movie?.title || "—"}
              </div>
              {movie?.rating && (
                <span className="mt-2 inline-block text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                  T{movie.rating}
                </span>
              )}
            </div>
          </div>

          {/* Suất chiếu */}
          <div className="text-base">
            <div className="text-gray-600">
              {theater?.name}
              {room?.name ? ` – ${room.name}` : ""}
            </div>
            <div>Suất: {formatVNDate(show?.startTime)}</div>
          </div>

          <hr className="border-dashed" />

          {/* Ghế */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{selectedSeats.length}x Ghế</span>
              <b>{ticketTotal.toLocaleString()} đ</b>
            </div>
            <div className="text-sm opacity-70">
              Ghế: {selectedSeats.join(", ")}
            </div>
          </div>

          {/* Combo */}
          {comboTotal > 0 && (
            <div className="flex justify-between">
              <span>Combo</span>
              <b>{comboTotal.toLocaleString()} đ</b>
            </div>
          )}

          <hr className="border-dashed" />

          {/* Tổng cộng */}
          <div className="flex justify-between text-xl font-bold">
            <span>Tổng cộng</span>
            <b className="text-orange-600">
              {totalMoney.toLocaleString()} đ
            </b>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            className="btn-back"
            onClick={() => nav("/booking/combos", { state })}
          >
            Quay lại
          </button>

          <button className="btn-next" onClick={payWithMomo}>
            Thanh toán MoMo
          </button>
        </div>
      </div>
    </div>
  );
}
