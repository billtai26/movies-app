import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import QRCode from "qrcode.react";
import BookingBreadcrumb from "../../components/BookingBreadcrumb";
import { api } from "../../../lib/backendApi";

interface LocationState {
  id: string;
  selected: string[];
  ticketTotal: number;
  comboTotal: number;
  grandTotal: number;
  qty?: Record<string, number>;
  movieTitle?: string;
}

export default function Confirm() {
  const location = useLocation();
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

  // ===== 3. Gọi BE xác nhận MoMo, lấy booking (invoice) về =====
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

  // ===== 4. Xử lý ghế: ƯU TIÊN lấy từ booking (invoice.seats) =====
  const seatLabels = useMemo(() => {
    // 1. Nếu BE trả về seats từ booking
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

    // 2. Fallback: nếu vẫn còn state.selected (trường hợp quay lại từ app)
    if (state?.selected?.length) {
      return state.selected.join(", ");
    }

    return "";
  }, [invoice, state]);

  // ===== 5. Payload đưa vào QR: ĐỔI TỪ JSON → TEXT DỄ ĐỌC =====
  const bookingCode =
    (invoice?.bookingId || invoice?._id || momoParams.orderId || "").toString();

  const formatMoney = (v: number) =>
    v.toLocaleString("vi-VN") + " đ";

  const qrLines = [
    "Cinesta - Vé xem phim",
    bookingCode && `Mã đặt vé: ${bookingCode}`,
    seatLabels && `Ghế: ${seatLabels}`,
    amount > 0 && `Số tiền: ${formatMoney(amount)}`,
    momoParams.transId && `Mã giao dịch: ${momoParams.transId}`,
  ].filter(Boolean) as string[];

  // Chuỗi text cuối cùng cho QR
  const qrPayload = qrLines.join("\n");

  // ===== 6. Giá trị hiển thị bên phải =====
  const ticketTotal = state?.ticketTotal ?? amount;
  const comboTotal = state?.comboTotal ?? 0;
  const grandTotal = state?.grandTotal ?? amount;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <BookingBreadcrumb currentStep="confirm" />
      </div>

      {/* BÊN TRÁI: QR */}
      <div className="card text-center">
        <div className="mb-2 text-xl font-semibold">Thanh toán thành công!</div>

        <div className="flex justify-center">
          <QRCode value={qrPayload} size={220} />
        </div>

        <div className="mt-3 space-y-1 text-sm text-gray-700">
          <div>
            Mã đặt vé:{" "}
            <span className="font-semibold">
              {bookingCode || "—"}
            </span>
          </div>
          <div>
            Số tiền:{" "}
            <span className="font-semibold">
              {amount.toLocaleString()} đ
            </span>
          </div>
          <div>
            Ghế:{" "}
            <span className="font-semibold">
              {seatLabels || "—"}
            </span>
          </div>
        </div>

        {loading && (
          <div className="mt-2 text-xs text-gray-500">
            Đang đồng bộ thông tin vé...
          </div>
        )}
      </div>

      {/* BÊN PHẢI: TÓM TẮT VÉ */}
      <div className="card space-y-3">
        <div className="text-base font-semibold">Tóm tắt vé</div>

        {seatLabels && (
          <div className="text-sm text-gray-700">
            Ghế: <span className="font-semibold">{seatLabels}</span>
          </div>
        )}

        {(ticketTotal || seatLabels) && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-base">
                <span>Vé</span>
                <b className="text-lg">{ticketTotal.toLocaleString()} đ</b>
              </div>
              {seatLabels && (
                <div className="text-xs text-gray-500">
                  Ghế: {seatLabels}
                </div>
              )}
            </div>

            {comboTotal > 0 && (
              <div className="flex items-center justify-between text-base">
                <span>Combo</span>
                <b className="text-lg">{comboTotal.toLocaleString()} đ</b>
              </div>
            )}

            <hr className="my-2 border-t border-dashed border-gray-300" />
          </>
        )}

        <div className="flex items-center justify-between text-xl font-bold">
          <span>Tổng cộng</span>
          <b className="text-2xl text-orange-600">
            {grandTotal.toLocaleString()} đ
          </b>
        </div>
      </div>
    </div>
  );
}
