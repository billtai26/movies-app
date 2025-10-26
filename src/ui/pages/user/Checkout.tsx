
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode.react'
export default function Checkout(){
  const nav = useNavigate()
  const { state } = useLocation() as any
  const payload = JSON.stringify({ type:'ticket', at: Date.now(), ...state })
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card space-y-3">
        <h3 className="text-lg font-semibold">Phương thức thanh toán</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <button className="btn-outline">MoMo (mock)</button>
          <button className="btn-outline">Chuyển khoản (mock)</button>
          <button className="btn-outline">Thẻ nội địa (mock)</button>
          <button className="btn-outline">Credit Card (mock)</button>
        </div>
        <button className="btn-primary w-full" onClick={()=>nav('/tickets',{ state:{ ticket: payload }})}>Thanh toán (mock)</button>
      </div>
      <div className="card space-y-2 text-center">
        <div className="font-semibold">Mã QR vé (demo)</div>
        <div className="flex justify-center"><QRCode value={payload} size={220}/></div>
        <div className="text-xs text-gray-500 break-all">{payload}</div>
      </div>
    </div>
  )
}
