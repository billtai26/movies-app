
import React from 'react'
import { useLocation } from 'react-router-dom'
import QRCode from 'qrcode.react'
export default function Tickets(){
  const { state } = useLocation() as any
  const ticket = state?.ticket || JSON.stringify({ sample:true, at: Date.now() })
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Vé của tôi</h2>
      <div className="card flex items-center gap-6"><QRCode value={ticket} size={120}/><div className="text-sm text-gray-600 break-all">{ticket}</div></div>
    </div>
  )
}
