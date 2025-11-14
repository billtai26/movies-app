import React from 'react'

// Component này chỉ nhận số giây còn lại và hiển thị
export default function Countdown({ secondsLeft }:{ secondsLeft: number }){
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  
  return (
    <div className="rounded-xl bg-gray-900 px-3 py-1 text-white">
      Giữ ghế: {mm}:{ss}
    </div>
  )
}
