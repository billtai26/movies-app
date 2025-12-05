// src/ui/pages/booking/Confirm.tsx
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode.react' // Cần cài: npm install qrcode.react
import BookingBreadcrumb from '../../components/BookingBreadcrumb'
import { api } from '../../../lib/backendApi' // Chú ý: dùng backendApi thay vì api mock cũ
import { CheckCircle, Calendar, MapPin, Clock } from 'lucide-react'

// Định nghĩa kiểu dữ liệu cho Vé/Hóa đơn
interface TicketData {
  _id: string;
  movieTitle: string;
  cinemaName: string;
  theaterName: string; // Tên phòng chiếu
  startTime: string;
  seatNumbers: string[];
  totalPrice: number;
  bookingCode?: string; // Mã đặt vé (nếu có)
}

export default function Confirm() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Lấy invoice từ state khi chuyển trang (từ Payment -> Confirm)
  // Hoặc nếu user refresh, cần logic load lại từ API dựa vào ID trên URL (chưa implement ở đây)
  const invoice = location.state?.invoice as TicketData | undefined

  useEffect(() => {
    // Nếu không có dữ liệu hóa đơn, quay về trang chủ
    if (!invoice) {
      // Có thể thêm logic check URL param để fetch lại vé nếu muốn
      const timer = setTimeout(() => navigate('/'), 3000);
      return () => clearTimeout(timer);
    }
  }, [invoice, navigate])

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy thông tin vé!</h2>
        <p className="text-gray-500">Đang chuyển hướng về trang chủ...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gray-900 text-white pb-10 pt-4">
          <div className="container mx-auto px-4">
              <BookingBreadcrumb currentStep="confirm" />
          </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto overflow-hidden">
          {/* Header Success */}
          <div className="bg-green-600 p-6 text-center text-white">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold uppercase">Thanh toán thành công!</h1>
            <p className="opacity-90 mt-2">Cảm ơn bạn đã đặt vé tại Movies App.</p>
          </div>

          {/* Ticket Details */}
          <div className="p-8">
             <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Left: QR Code */}
                <div className="flex-shrink-0 mx-auto md:mx-0 text-center">
                   <div className="border-4 border-gray-900 p-2 inline-block rounded-lg">
                      <QRCode 
                        value={invoice.bookingCode || invoice._id} 
                        size={150} 
                        level={"H"}
                        includeMargin={true}
                      />
                   </div>
                   <p className="mt-2 text-sm text-gray-500 font-mono font-bold tracking-widest">
                     {invoice.bookingCode || "NO-CODE"}
                   </p>
                   <p className="text-xs text-gray-400">Đưa mã này cho nhân viên soát vé</p>
                </div>

                {/* Right: Info */}
                <div className="flex-grow space-y-4 text-gray-800">
                    <h2 className="text-2xl font-bold text-primary">{invoice.movieTitle}</h2>
                    
                    <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                           <MapPin className="w-5 h-5 text-gray-400" />
                           <div>
                              <p className="font-semibold">{invoice.cinemaName}</p>
                              <p className="text-gray-500">{invoice.theaterName}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-2">
                           <Calendar className="w-5 h-5 text-gray-400" />
                           <p className="font-semibold">
                             {new Date(invoice.startTime).toLocaleDateString('vi-VN', {
                                weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
                             })}
                           </p>
                        </div>

                        <div className="flex items-center gap-2">
                           <Clock className="w-5 h-5 text-gray-400" />
                           <p className="font-semibold text-lg">
                             {new Date(invoice.startTime).toLocaleTimeString('vi-VN', {
                                hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh'
                             })}
                           </p>
                        </div>
                    </div>

                    <div className="border-t border-dashed my-4 pt-4">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-gray-500">Ghế:</span>
                           <span className="font-bold text-lg">{invoice.seatNumbers.join(", ")}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl text-primary font-bold">
                           <span>Tổng tiền:</span>
                           <span>{invoice.totalPrice?.toLocaleString('vi-VN')} đ</span>
                        </div>
                    </div>
                </div>
             </div>

             <div className="mt-8 text-center space-x-4">
                <button 
                  onClick={() => navigate('/')}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-semibold transition"
                >
                  Về trang chủ
                </button>
                <button 
                  onClick={() => navigate('/profile')} 
                  className="px-6 py-2 bg-primary text-white hover:bg-primary/90 rounded-full font-semibold transition"
                >
                  Xem vé của tôi
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
