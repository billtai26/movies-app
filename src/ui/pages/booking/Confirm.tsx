
import React from 'react'
import { useLocation } from 'react-router-dom'
import QRCode from 'qrcode.react'

export default function Confirm(){
  const { state } = useLocation() as any
  const payload = JSON.stringify({ type:'ticket', at: Date.now(), ...state })
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card text-center">
        <div className="mb-2 text-lg font-semibold">Thanh toán thành công</div>
        <div className="flex justify-center"><QRCode value={payload} size={220}/></div>
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 break-all">{payload}</div>
      </div>
      <div className="card">
        <div className="font-semibold">Chi tiết vé</div>
        <div className="text-sm text-gray-600 dark:text-gray-300 break-all">{JSON.stringify(state)}</div>
      </div>
    </div>
  )
}
