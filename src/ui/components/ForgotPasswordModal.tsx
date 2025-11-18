import React from 'react'
// 1. Di chuyển import 'api' lên đầu và thêm 'AlertCircle'
import { api } from '../../lib/api' 
import { X, AlertCircle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ open, onClose }: Props) {
  const [email, setEmail] = React.useState('')
  // 2. Thêm state mới để quản lý màn hình "Thành công"
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (!open) {
      setEmail('')
      // 3. Reset state thành công khi modal đóng
      setIsSuccess(false)
      setError('')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      alert('⚠️ Vui lòng nhập email')
      return
    }
    try{
      //
      const res = await api.requestPasswordReset(email) 
      
      // 4. Thay vì alert và close, set state "Thành công"
      setIsSuccess(true) 
      
    }catch(err:any){
      setError(err?.response?.data?.message || err?.message || 'Vui lòng thử lại.')
    }
  }

  if (!open) return null

  // 5. Render có điều kiện
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50" 
        // Không cho bấm ra ngoài để đóng khi màn hình thành công hiện ra
        onClick={isSuccess ? undefined : onClose} 
      />

      {isSuccess ? (
        // --- NẾU THÀNH CÔNG: HIỂN THỊ MÀN HÌNH NÀY ---
        <div className="relative z-10 w-[400px] bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center text-center">
          {/* 6. Dùng icon "chấm than" màu cam */}
          <AlertCircle size={64} className="text-orange-500 mb-4" />
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Đã Gửi Yêu Cầu
          </h3>
          
          {/* 7. Hiển thị nội dung thông báo từ code FE */}
          <p className="text-sm text-gray-700 mb-6">
            ✅ Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!
          </p>

          <button
            // Nút này sẽ đóng modal
            onClick={onClose} 
            className="w-full bg-[#f58a1f] hover:bg-[#e47316] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            HOÀN TẤT
          </button>
        </div>

      ) : (
        // --- NẾU CHƯA THÀNH CÔNG: HIỂN THỊ FORM NHƯ CŨ ---
        <div className="relative z-10 w-[400px] bg-white rounded-xl shadow-2xl p-8">
          <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={onClose} aria-label="close">
            <X size={20} />
          </button>
          
          {/* Header với hình ảnh (Giữ nguyên) */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4 relative">
              <svg width="120" height="80" viewBox="0 0 120 80" className="mb-2">
                <ellipse cx="30" cy="25" rx="15" ry="8" fill="#e6f3ff" opacity="0.7"/>
                <ellipse cx="90" cy="20" rx="12" ry="6" fill="#e6f3ff" opacity="0.7"/>
                <ellipse cx="60" cy="15" rx="10" ry="5" fill="#e6f3ff" opacity="0.7"/>
                <circle cx="35" cy="50" r="12" fill="#f4a261"/>
                <circle cx="32" cy="47" r="2" fill="#000"/>
                <circle cx="38" cy="47" r="2" fill="#000"/>
                <ellipse cx="35" cy="52" rx="3" ry="2" fill="#000"/>
                <circle cx="35" cy="40" r="3" fill="#f4a261"/>
                <circle cx="35" cy="40" r="2" fill="#2a9d8f"/>
                <circle cx="85" cy="50" r="12" fill="#e76f51"/>
                <circle cx="82" cy="47" r="2" fill="#000"/>
                <circle cx="88" cy="47" r="2" fill="#000"/>
                <ellipse cx="85" cy="52" rx="2" ry="1" fill="#000"/>
                <rect x="80" y="35" width="10" height="8" rx="2" fill="#264653"/>
                <circle cx="85" cy="39" r="2" fill="#f4a261"/>
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Quên Mật Khẩu?</h2>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Vui lòng cung cấp email đăng nhập, chúng tôi sẽ gửi<br />
              link khôi phục cho bạn.
            </p>
          </div>

          {/* Form (Giữ nguyên) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-center text-red-600 text-sm">
                {error}
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" 
                placeholder="Nhập Email" 
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-[#f58a1f] hover:bg-[#e47316] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 mt-6"
            >
              CẬP NHẬT LẠI MẬT KHẨU
            </button>
          </form>
          
          <div className="text-center mt-4">
            <button 
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
// 8. Xóa import 'api' thừa ở cuối file
