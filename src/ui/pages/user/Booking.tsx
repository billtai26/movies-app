
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
export default function Booking(){
  const { showtimeId } = useParams()
  const nav = useNavigate()
  React.useEffect(()=>{
    if (showtimeId) nav(`/booking/seats/${showtimeId}`)
    else nav('/booking/select')
  }, [showtimeId])
  return (
    <div className="flex items-center justify-center h-48 text-gray-500">Đang chuyển hướng…</div>
  )
}
