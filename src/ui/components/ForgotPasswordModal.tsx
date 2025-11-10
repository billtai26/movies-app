import React from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ open, onClose }: Props) {
  const [email, setEmail] = React.useState('')

  React.useEffect(() => {
    if (!open) {
      setEmail('')
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      alert('⚠️ Vui lòng nhập email')
      return
    }
    alert('✅ Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-[400px] bg-white rounded-xl shadow-2xl p-8">
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={onClose} aria-label="close">
          <X size={20} />
        </button>
        
        {/* Header với hình ảnh */}
        <div className="flex flex-col items-center mb-6">
          <div className="mb-4 relative">
            {/* Tạo hình ảnh SVG giống mẫu */}
            <svg width="120" height="80" viewBox="0 0 120 80" className="mb-2">
              {/* Background clouds */}
              <ellipse cx="30" cy="25" rx="15" ry="8" fill="#e6f3ff" opacity="0.7"/>
              <ellipse cx="90" cy="20" rx="12" ry="6" fill="#e6f3ff" opacity="0.7"/>
              <ellipse cx="60" cy="15" rx="10" ry="5" fill="#e6f3ff" opacity="0.7"/>
              
              {/* Dog character */}
              <circle cx="35" cy="50" r="12" fill="#f4a261"/>
              <circle cx="32" cy="47" r="2" fill="#000"/>
              <circle cx="38" cy="47" r="2" fill="#000"/>
              <ellipse cx="35" cy="52" rx="3" ry="2" fill="#000"/>
              <circle cx="35" cy="40" r="3" fill="#f4a261"/>
              <circle cx="35" cy="40" r="2" fill="#2a9d8f"/>
              
              {/* Police character */}
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
            link kích hoạt cho bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            CẬP LẠI MẬT KHẨU
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
    </div>
  )
}