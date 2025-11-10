
import React from 'react'
import { useLocation } from 'react-router-dom'
import QRCode from 'qrcode.react'
import BookingBreadcrumb from '../../components/BookingBreadcrumb'

export default function Confirm(){
  const { state } = useLocation() as any
  const payload = JSON.stringify({ type:'ticket', at: Date.now(), ...state })
  const ticketTotal = state?.ticketTotal ?? 0
  const comboTotal = state?.comboTotal ?? 0
  const grandTotal = state?.grandTotal ?? (ticketTotal + comboTotal)
  const seatLabels = state?.selected?.join(', ')
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2"><BookingBreadcrumb currentStep="confirm"/></div>
      <div className="card text-center">
        <div className="mb-2 text-xl font-semibold">Thanh toán thành công</div>
        <div className="flex justify-center"><QRCode value={payload} size={220}/></div>
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 break-all">{payload}</div>
      </div>
      <div className="card space-y-3">
        <div className="text-base font-semibold">Tóm tắt vé</div>
        {ticketTotal>0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-base">
              <span>Vé</span>
              <b className="text-lg">{ticketTotal.toLocaleString()} đ</b>
            </div>
            {seatLabels && <div className="text-xs text-gray-600">Ghế: {seatLabels}</div>}
          </div>
        )}
        {comboTotal>0 && (
          <div className="flex items-center justify-between text-base">
            <span>Combo</span>
            <b className="text-lg">{comboTotal.toLocaleString()} đ</b>
          </div>
        )}
        <hr className="my-2 border-t border-dashed border-gray-300 dark:border-gray-700" />
        <div className="flex items-center justify-between text-xl font-bold">
          <span>Tổng cộng</span>
          <b className="text-2xl text-orange-600">{grandTotal.toLocaleString()} đ</b>
        </div>
        <div className="text-[11px] text-gray-500 break-all">{JSON.stringify(state)}</div>
      </div>
    </div>
  )
}
