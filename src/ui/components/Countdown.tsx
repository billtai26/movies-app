
import React, { useEffect, useState } from 'react'
export default function Countdown({ seconds, onExpire }:{ seconds:number, onExpire:()=>void }){
  const [left, setLeft] = useState(seconds)
  useEffect(()=>{ const t=setInterval(()=>setLeft(l=>{ if(l<=1){ clearInterval(t); onExpire(); return 0 } return l-1 }),1000); return ()=>clearInterval(t)},[])
  const mm = String(Math.floor(left/60)).padStart(2,'0')
  const ss = String(left%60).padStart(2,'0')
  return <div className="rounded-xl bg-gray-900 px-3 py-1 text-white">Giữ ghế: {mm}:{ss}</div>
}
.