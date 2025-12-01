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

function Confirm() {
  const location = useLocation();
  const state = (location.state as LocationState | undefined) || undefined;

  // --- Lấy query từ URL khi MoMo redirect về ---
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

  // ====== 1. Tính số tiền tổng cộng để hiển thị ======
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

  // ====== 2. Gọi BE xác nhận callback MoMo, cập nhật DB & lấy invoice ======
  useEffect(() => {
    if (!momoParams.orderId || !momoParams.resultCode) return;
    if (momoParams.resultCode !== "0") return;

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

  // ====== 3. Lấy tên user (từ localStorage auth) ======
  const userName = useMemo(() => {
    try {
      const rawAuth =
        localStorage.getItem("auth") || localStorage.getItem("auth-storage");
      if (!rawAuth) return "Khách hàng";
      const st = JSON.parse(rawAuth);
      return (
        st?.user?.username ||
        st?.state?.user?.username ||
        st?.state?.profile?.username ||
        st?.user?.name ||
        "Khách hàng"
      );
    } catch {
      return "Khách hàng";
    }
  }, []);

  // ====== 4. Xử lý ghế để hiển thị ======
  const seatLabels = useMemo(() => {
    if (state?.selected?.length) {
      return state.selected.join(", ");
    }

    if (Array.isArray(invoice?.seats)) {
      const labels = invoice.seats
        .map((s: any) => {
          if (!s) return "";
          return (
            s.label ||
            s.code ||
            s.name ||
            s.seatLabel ||
            s.seatNumber ||
            (s.row && s.number ? `${s.row}${s.number}` : "")
          );
        })
        .filter(Boolean);
      return labels.join(", ");
    }

    return "";
  }, [state, invoice]);

  const ticketTotal = state?.ticketTotal ?? amount;
  const comboTotal = state?.comboTotal ?? 0;
  const grandTotal = state?.grandTotal ?? amount;

  const bookingCode =
    invoice?.bookingId || invoice?._id || momoParams.orderId || "—";

  // ====== 5. TEXT encode vào QR ======
  const qrText = useMemo(() => {
    const lines: string[] = [
      "CINESTAR MOVIE TICKET",
      `Tên: ${userName}`,
      `Ghế: ${seatLabels || "Không xác định"}`,
      `Số tiền: ${amount.toLocaleString("vi-VN")} đ`,
      `Mã đặt vé: ${bookingCode}`,
    ];

    if (state?.movieTitle) {
      lines.splice(1, 0, `Phim: ${state.movieTitle}`);
    }

    if (momoParams.transId) {
      lines.push(`Mã giao dịch: ${momoParams.transId}`);
    }

    return lines.join("\n");
  }, [userName, seatLabels, amount, bookingCode, state?.movieTitle, momoParams.transId]);

import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode.react'
import BookingBreadcrumb from '../../components/BookingBreadcrumb'
import { api } from '../../../lib/api'

export default function Confirm(){
  const { state } = useLocation() as any
  const nav = useNavigate()
  const payload = JSON.stringify({ type:'ticket', at: Date.now(), ...state })
  const ticketTotal = state?.ticketTotal ?? 0
  const comboTotal = state?.comboTotal ?? 0
  const grandTotal = state?.grandTotal ?? (ticketTotal + comboTotal)
  const seatLabels = state?.selected?.join(', ')
  React.useEffect(()=>{
    const showtimeId = state?.show?._id || state?.id || state?.show?.id
    const seats = Array.isArray(state?.selected) ? state.selected : []
    const theaterId = state?.theater?._id || state?.theater?.id || state?.theaterId
    const movieId = state?.movie?._id || state?.movie?.id || state?.movieId
    const body = { showtimeId, seats, total: grandTotal, theaterId, movieId, status: 'paid' }
    api.createMyTicket(body).catch(()=>{})
  },[])
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <BookingBreadcrumb currentStep="confirm" />
      </div>

      {/* BÊN TRÁI: QR */}
      <div className="card text-center">
        <div className="mb-2 text-xl font-semibold">Thanh toán thành công</div>
        <div className="flex justify-center"><QRCode value={payload} size={220}/></div>
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 break-all">{payload}</div>
        <div className="mt-3">
          <button className="btn-primary" onClick={()=> nav('/tickets')}>Xem lịch sử vé</button>
        </div>
      </div>

      {/* BÊN PHẢI: TÓM TẮT VÉ */}
      <div className="card space-y-3">
        <div className="text-base font-semibold">Tóm tắt vé</div>

        {seatLabels && (
          <div className="text-sm text-gray-700">
            Ghế: <span className="font-semibold">{seatLabels}</span>
          </div>
        )}

        {state && (
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
    </div>
  );
}

// 👇 QUAN TRỌNG: default export
export default Confirm;
