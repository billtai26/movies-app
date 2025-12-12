import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "qrcode.react";
import BookingBreadcrumb from "../../components/BookingBreadcrumb";
import { api } from "../../../lib/backendApi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface LocationState {
  id: string; // showtimeId
  selected: string[];
  ticketTotal: number;
  comboTotal: number;
  grandTotal: number;
  qty?: Record<string, number>;
  movieTitle?: string;
  [key: string]: any;
}

export default function Confirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState | undefined) || undefined;

  // ===== 1. Lấy query từ URL khi MoMo redirect về =====
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const momoParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    momoParams[key] = value;
  });

  const [amount, setAmount] = useState<number>(0);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [movieTitle, setMovieTitle] = useState<string>("");
  const [showtimeText, setShowtimeText] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState(false);

  // chỉ dùng cho phần export / QR (giữ nguyên sau mỗi render)
  const issuedAtRef = useRef<number | null>(null);
  if (!issuedAtRef.current) issuedAtRef.current = Date.now();
  const issuedAt = issuedAtRef.current!;

  // ref cho phần nội dung vé (không gồm các nút)
  const ticketContentRef = useRef<HTMLDivElement | null>(null);

  // ===== Helper format ngày giờ kiểu Việt =====
  const formatVNDate = (dateStr?: string) => {
    if (!dateStr) return "";
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
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${hh}:${mm} - ${days[d.getDay()]}, ${dd}/${MM}/${yyyy}`;
  };

  // ===== 2. Tính số tiền tổng cộng để hiển thị =====
  useEffect(() => {
    let a = 0;

    if (state) {
      const ticketTotal = state.ticketTotal ?? 0;
      const comboTotal = state.comboTotal ?? 0;
      a = state.grandTotal ?? ticketTotal + comboTotal;
    }

    if (momoParams.amount) {
      const momoAmount = Number(momoParams.amount);
      if (!Number.isNaN(momoAmount) && momoAmount > 0) {
        a = momoAmount;
      }
    }

    setAmount(a);
  }, [state, momoParams.amount]);

  // ===== 3. Gọi BE xác nhận MoMo, lấy booking (invoice) =====
  useEffect(() => {
    if (!momoParams.orderId || !momoParams.resultCode) return;
    if (momoParams.resultCode !== "0") return; // thất bại thì thôi

    (async () => {
      try {
        setLoading(true);
        const res = await api.momoConfirm(momoParams);
        setInvoice(res.invoice || null);
      } catch (err: any) {
        console.error(
          "Xác nhận thanh toán MoMo thất bại:",
          err?.response?.data || err
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [momoParams.orderId, momoParams.resultCode]);

  // ===== 4. Load thêm: tên khách, phim, suất chiếu =====
  useEffect(() => {
    (async () => {
      try {
        // --- Khách: từ invoice -> state -> localStorage ---
        if (!customerName) {
          let fromInvoice =
            invoice?.customerName ||
            invoice?.userName ||
            invoice?.userFullName ||
            invoice?.userEmail ||
            invoice?.email;

          let fromState: string | undefined;
          if (state) {
            const s: any = state;
            fromState =
              s.customerName ||
              s.userName ||
              s.fullName ||
              s.name ||
              s.email ||
              s.userEmail;
          }

          let fromLocal = "";
          const stored =
            localStorage.getItem("userInfo") ||
            localStorage.getItem("user") ||
            localStorage.getItem("cinesta_user");
          if (stored) {
            try {
              const u = JSON.parse(stored);
              fromLocal =
                u.fullName || u.name || u.email || u.username || u.userEmail;
            } catch {
              /* ignore */
            }
          }

          const finalName = fromInvoice || fromState || fromLocal || "";
          if (finalName) setCustomerName(finalName);
        }

        // --- Phim ---
        if (!movieTitle) {
          const movieId =
            invoice?.movieId || (state as any)?.movieId || invoice?.movie?._id;

          if (movieId) {
            try {
              const m = await api.getMovie(String(movieId));
              if (m?.title) setMovieTitle(m.title);
            } catch {
              /* ignore */
            }
          } else if (state?.movieTitle) {
            setMovieTitle(state.movieTitle);
          }
        }

        // --- Suất chiếu ---
        if (!showtimeText) {
          const stId = invoice?.showtimeId || state?.id;
          if (stId) {
            try {
              const st = await api.getShowtime(String(stId));
              if (st?.startTime) setShowtimeText(formatVNDate(st.startTime));
            } catch {
              /* ignore */
            }
          }
        }
      } catch (err) {
        console.error("Lỗi load thêm thông tin vé:", err);
      }
    })();
  }, [invoice, state, customerName, movieTitle, showtimeText]);

  // ===== 5. Xử lý ghế =====
  const seatLabels = useMemo(() => {
    if (Array.isArray(invoice?.seats) && invoice.seats.length) {
      const labels = invoice.seats
        .map((s: any) => {
          if (!s) return "";
          return (
            s.label ||
            s.code ||
            s.name ||
            s.seatLabel ||
            s.seatNumber ||
            (s.row && s.number != null ? `${s.row}${s.number}` : "")
          );
        })
        .filter(Boolean);
      return labels.join(", ");
    }

    if (state?.selected?.length) {
      return state.selected.join(", ");
    }

    return "";
  }, [invoice, state]);

  // ===== 6. Nội dung cho QR (không phải JSON) =====
  const bookingId =
    invoice?.bookingId || invoice?._id || momoParams.orderId || "";

  const qrValue = [
    "CINESTA - VÉ XEM PHIM",
    bookingId ? `Mã đặt vé: ${bookingId}` : "",
    customerName ? `Khách: ${customerName}` : "",
    movieTitle ? `Phim: ${movieTitle}` : "",
    showtimeText ? `Suất chiếu: ${showtimeText}` : "",
    seatLabels ? `Ghế: ${seatLabels}` : "",
    `Số tiền: ${amount.toLocaleString("vi-VN")} đ`,
  ]
    .filter(Boolean)
    .join("\n");

  // ===== 7. Nội dung file .txt =====
  const ticketText = useMemo(() => {
    const lines = [
      "CINESTA - THÔNG TIN VÉ",
      `Mã đặt vé: ${bookingId || "—"}`,
      `Khách: ${customerName || "—"}`,
      `Phim: ${movieTitle || "—"}`,
      `Suất chiếu: ${showtimeText || "—"}`,
      `Ghế: ${seatLabels || "—"}`,
      `Số tiền: ${amount.toLocaleString("vi-VN")} đ`,
      `Xuất vé lúc: ${new Date(issuedAt).toLocaleString("vi-VN")}`,
    ];
    return lines.join("\n");
  }, [
    bookingId,
    customerName,
    movieTitle,
    showtimeText,
    seatLabels,
    amount,
    issuedAt,
  ]);

  const handleDownloadTxt = () => {
    const blob = new Blob([ticketText], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cinesta-ticket-${bookingId || "unknown"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ===== 8. Xuất PDF: chỉ chụp phần ticketContentRef (không gồm nút) =====
  const handleDownloadPdf = async () => {
    if (!ticketContentRef.current) return;
    try {
      const canvas = await html2canvas(ticketContentRef.current, {
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`cinesta-ticket-${bookingId || "unknown"}.pdf`);
    } catch (err) {
      console.error("Lỗi xuất PDF:", err);
      alert("Không xuất được PDF, thử lại sau nhé.");
    }
  };

  // ===== 9. Tổng tiền bên phải =====
  const ticketTotal = state?.ticketTotal ?? amount;
  const comboTotal = state?.comboTotal ?? 0;
  const grandTotal = state?.grandTotal ?? amount;

  // ===== JSX =====
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <BookingBreadcrumb currentStep="confirm" />
      </div>

      {/* BÊN TRÁI: QR + thông tin vé */}
      <div className="card text-center relative">
        {/* Phần này sẽ được chụp thành PDF */}
        <div ref={ticketContentRef}>
          <div className="mb-2 text-xl font-semibold">
            Thanh toán thành công!
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="relative group focus:outline-none"
            >
              <QRCode value={qrValue} size={220} />
            </button>
          </div>

          <p className="mt-2 text-[11px] text-gray-500">
            Bấm vào QR để phóng to khi nhân viên quét vé.
          </p>

          <div className="mt-4 space-y-1 text-sm text-gray-700">
            <div>
              Mã đặt vé:{" "}
              <span className="font-semibold">{bookingId || "—"}</span>
            </div>
            {customerName && (
              <div>
                Khách:{" "}
                <span className="font-semibold break-all">
                  {customerName}
                </span>
              </div>
            )}
            {movieTitle && (
              <div>
                Phim: <span className="font-semibold">{movieTitle}</span>
              </div>
            )}
            {showtimeText && (
              <div>
                Suất chiếu:{" "}
                <span className="font-semibold">{showtimeText}</span>
              </div>
            )}
            <div>
              Số tiền:{" "}
              <span className="font-semibold">
                {amount.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div>
              Ghế: <span className="font-semibold">{seatLabels || "—"}</span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-2 text-xs text-gray-500">
            Đang đồng bộ thông tin vé...
          </div>
        )}

        {/* Nút KHÔNG nằm trong ticketContentRef nên PDF sẽ không có */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
          >
            Tải vé (.txt)
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
          >
            Xuất vé PDF
          </button>
        </div>
      </div>

      {/* BÊN PHẢI: TÓM TẮT VÉ */}
      <div className="card space-y-3">
        <div className="text-base font-semibold">Tóm tắt vé</div>

        <div className="space-y-1 text-sm text-gray-700">
          {movieTitle && (
            <div>
              Phim: <span className="font-semibold">{movieTitle}</span>
            </div>
          )}
          {showtimeText && (
            <div>
              Suất chiếu:{" "}
              <span className="font-semibold">{showtimeText}</span>
            </div>
          )}
          {customerName && (
            <div>
              Khách:{" "}
              <span className="font-semibold break-all">
                {customerName}
              </span>
            </div>
          )}
          {seatLabels && (
            <div>
              Ghế: <span className="font-semibold">{seatLabels}</span>
            </div>
          )}
        </div>

        {(ticketTotal || seatLabels) && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-base">
                <span>Vé</span>
                <b className="text-lg">
                  {ticketTotal.toLocaleString("vi-VN")} đ
                </b>
              </div>
              {seatLabels && (
                <div className="text-xs text-gray-500">Ghế: {seatLabels}</div>
              )}
            </div>

            {comboTotal > 0 && (
              <div className="flex items-center justify-between text-base">
                <span>Combo</span>
                <b className="text-lg">
                  {comboTotal.toLocaleString("vi-VN")} đ
                </b>
              </div>
            )}

            <hr className="my-2 border-t border-dashed border-gray-300" />
          </>
        )}

        <div className="flex items-center justify-between text-xl font-bold">
          <span>Tổng cộng</span>
          <b className="text-2xl text-orange-600">
            {grandTotal.toLocaleString("vi-VN")} đ
          </b>
        </div>
      </div>

      {/* HÀNG DƯỚI: nút về trang chủ */}
      <div className="md:col-span-2 flex justify-end">
        <button
          type="button"
          className="btn-next"
          onClick={() => navigate("/", { replace: true })}
        >
          Về trang chủ
        </button>
      </div>

      {/* MODAL PHÓNG TO QR */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <QRCode value={qrValue} size={320} />
            <button
              type="button"
              className="px-4 py-1 rounded-lg border text-sm hover:bg-gray-50"
              onClick={() => setShowQrModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
