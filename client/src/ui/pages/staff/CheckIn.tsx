import { api } from '../../../lib/api'
import React, { useState } from 'react'
import QRCode from 'qrcode.react'
export default function CheckIn(){
  const [input, setInput] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const approve = () => { setLogs(l => [`${new Date().toLocaleTimeString()}: Vé hợp lệ`, ...l]); setInput('') }
  return (
    <div className="space-y-4">
      <div className="text-xl font-bold">Quét/nhập mã vé</div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-2">
          <input className="input" placeholder="Dán payload QR..." value={input} onChange={e=>setInput(e.target.value)}/>
          <button className="btn-primary" onClick={approve}>Xác thực vé</button>
        </div>
        <div className="card">
          <div className="mb-2 font-semibold">Mô phỏng QR mẫu</div>
          <QRCode value={JSON.stringify({ sample:true, at: Date.now() })} size={160}/>
        </div>
      </div>
      <div className="card">
        <div className="mb-2 font-semibold">Nhật ký</div>
        <ul className="space-y-1 text-sm text-gray-700">{logs.map((l,i)=><li key={i}>• {l}</li>)}</ul>
      </div>
    </div>
  )
}
