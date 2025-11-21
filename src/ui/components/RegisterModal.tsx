import React, { useState, useEffect } from 'react'
import { useAuth } from '../../store/auth' //
import { api } from '../../lib/api' //
import { Eye, EyeOff, X, Calendar, CheckCircle2, AlertCircle } from 'lucide-react' // Thêm AlertCircle
import LoadingOverlay from "./LoadingOverlay";

export default function RegisterModal({ open, onClose }:{ open:boolean; onClose:()=>void }){
  // const login = useAuth(s=>s.login) // (Không dùng dòng này thì có thể bỏ)
  
  // 1. State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    email: '',
    phone: '',
    gender: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })

  // State hiển thị mật khẩu
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  // State quản lý màn hình "Thành công" & "Loading"
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false);

  // 2. THÊM STATE MỚI ĐỂ QUẢN LÝ LỖI
  const [error, setError] = useState<string>('');

  // Reset form khi đóng modal
  useEffect(()=>{
    if(!open){ 
      setFormData({
        fullName: '',
        userName: '',
        email: '',
        phone: '',
        gender: '',
        birthDate: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
      })
      setShowPwd(false)
      setShowConfirmPwd(false)
      setIsSuccess(false)
      setError('') // Reset lỗi khi đóng modal
    }
  },[open])

  // Hàm xử lý khi người dùng thay đổi input (để xóa lỗi cũ đi cho đỡ rối)
  const handleChangeRaw = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Người dùng nhập lại thì ẩn lỗi đi
  }

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault()
    setError('') // Reset lỗi mỗi khi bấm submit
    
    // --- VALIDATION (Thay alert bằng setError) ---

    // Validate required fields
    if(!formData.fullName.trim()){
      setError('Vui lòng nhập họ và tên')
      return
    }
    
    if(formData.fullName.trim().length < 2){
      setError('Họ và tên phải có ít nhất 2 ký tự')
      return
    }

    if(!formData.userName.trim()){
      setError('Vui lòng nhập username')
      return
    }
    
    if(formData.userName.trim().length < 3){
      setError('Username phải có ít nhất 3 ký tự')
      return
    }
    
    // Email validation
    if(!formData.email.trim()){
      setError('Vui lòng nhập email')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!emailRegex.test(formData.email)){
      setError('Email không đúng định dạng')
      return
    }
    
    // Phone validation
    if(!formData.phone.trim()){
      setError('Vui lòng nhập số điện thoại')
      return
    }
    
    const phoneRegex = /^0[0-9]{9,10}$/
    if(!phoneRegex.test(formData.phone)){
      setError('Số điện thoại phải có 10-11 số và bắt đầu bằng số 0')
      return
    }
    
    // Gender validation
    if(!formData.gender){
      setError('Vui lòng chọn giới tính')
      return
    }
    
    // Birth date validation
    if(!formData.birthDate){
      setError('Vui lòng chọn ngày sinh')
      return
    }
    
    const birthYear = new Date(formData.birthDate).getFullYear()
    const currentYear = new Date().getFullYear()
    const age = currentYear - birthYear
    
    if(age < 13){
      setError('Bạn phải từ 13 tuổi trở lên để đăng ký')
      return
    }
    
    if(age > 100){
      setError('Ngày sinh không hợp lệ')
      return
    }
    
    // Password validation
    if(!formData.password){
      setError('Vui lòng nhập mật khẩu')
      return
    }
    
    if(formData.password.length < 6){
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    
    // Confirm password validation
    if(!formData.confirmPassword){
      setError('Vui lòng nhập lại mật khẩu')
      return
    }
    
    if(formData.password !== formData.confirmPassword){
      setError('Mật khẩu nhập lại không khớp')
      return
    }

    // Terms check
    if(!formData.agreeToTerms){
        setError('Vui lòng đồng ý với điều khoản dịch vụ')
        return
    }

    // --- CALL API ---
    try{
      setIsLoading(true);
      const payload = {
        username: formData.userName,
        email: formData.email,
        password: formData.password
      }
      const res:any = await api.register(payload as any)
      const token = res?.token
      const user = res?.user || res?.data || undefined
      
      if (token){
        const name = user?.name || formData.fullName
        const avatarUrl = user?.avatar || `https://i.pravatar.cc/150?u=${formData.email}`
        const uid = user?._id || user?.id || null
        useAuth.getState().setSession({ token, name, email: formData.email, avatar: avatarUrl, role: 'user', userId: uid || undefined })
      }
      
      setIsSuccess(true)
    }catch (err: any) {
      console.error("Lỗi đăng ký:", err);
      
      // 1. Lấy dữ liệu lỗi từ Backend trả về
      const responseData = err?.response?.data;

      // 2. Ưu tiên lấy trường 'errors' (vì backend của bạn trả về field này)
      // Nếu không có thì mới tìm 'message', cuối cùng là lỗi mặc định
      const errorMessage = 
        responseData?.errors ||      // <-- QUAN TRỌNG: Đây là cái backend bạn đang trả về
        responseData?.message ||     // Fallback nếu backend đổi cấu trúc
        err?.message ||              // Fallback lỗi HTTP
        'Đăng ký thất bại. Vui lòng thử lại.';

      // 3. Hiển thị chuỗi lỗi đã lọc sạch
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  if(!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={isSuccess ? undefined : onClose} 
      />

      {isSuccess ? (
        // --- MÀN HÌNH THÀNH CÔNG ---
        <div className="relative z-10 w-[480px] bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center animate-fadeIn">
          <CheckCircle2 size={64} className="text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Đăng Ký Thành Công!</h3>
          <p className="text-sm text-gray-700 mb-6">
            🎉 Tài khoản đã được tạo.
          </p>
          <button
            onClick={onClose} 
            className="w-full bg-[#f58a1f] hover:bg-[#f07a00] text-white font-medium h-10 rounded transition-colors"
          >
            HOÀN TẤT
          </button>
        </div>

      ) : (
        // --- FORM ĐĂNG KÝ ---
        <div className="relative z-10 w-[480px] bg-white rounded-lg shadow-lg p-6 animate-fadeIn">
          <button className="absolute right-3 top-3 text-gray-500 hover:text-gray-800" onClick={onClose} aria-label="close">
            <X />
          </button>
          
          <div className="flex flex-col items-center mb-4">
            <h3 className="text-lg font-semibold">Đăng Ký Tài Khoản</h3>
          </div>

          {/* 3. KHUNG HIỂN THỊ LỖI (Render có điều kiện) */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-3 text-red-600 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              
              <div className="col-span-2">
                <label className="text-sm text-gray-700 block mb-1">Họ và tên</label>
                <input 
                  value={formData.fullName} 
                  onChange={e => handleChangeRaw('fullName', e.target.value)}
                  className={`w-full rounded border px-3 h-9 focus:outline-none focus:ring-1 focus:ring-[#f58a1f] ${error && !formData.fullName ? 'border-red-500' : ''}`}
                  placeholder="Nhập Họ và tên" 
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-700 block mb-1">Username</label>
                <input 
                  value={formData.userName} 
                  onChange={e => handleChangeRaw('userName', e.target.value)}
                  className="w-full rounded border px-3 h-9 focus:outline-none focus:ring-1 focus:ring-[#f58a1f]" 
                  placeholder="Nhập username" 
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-700 block mb-1">Email</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={e => handleChangeRaw('email', e.target.value)}
                  className="w-full rounded border px-3 h-9 focus:outline-none focus:ring-1 focus:ring-[#f58a1f]"
                  placeholder="Nhập Email"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-700 block mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e=>{
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11)
                    handleChangeRaw('phone', value)
                  }}
                  className="w-full rounded border px-3 h-9 focus:outline-none focus:ring-1 focus:ring-[#f58a1f]"
                  placeholder="Nhập Số điện thoại"
                  maxLength={11}
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 block mb-1">Giới tính</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Nam"
                      checked={formData.gender === 'Nam'}
                      onChange={e => handleChangeRaw('gender', e.target.value)}
                      className="text-[#f58a1f] focus:ring-[#f58a1f]"
                    />
                    <span className="text-sm">Nam</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Nữ"
                      checked={formData.gender === 'Nữ'}
                      onChange={e => handleChangeRaw('gender', e.target.value)}
                      className="text-[#f58a1f] focus:ring-[#f58a1f]"
                    />
                    <span className="text-sm">Nữ</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-700 block mb-1">Ngày sinh</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={e => handleChangeRaw('birthDate', e.target.value)}
                    className="w-full rounded border px-3 h-9 pr-9 focus:outline-none focus:ring-1 focus:ring-[#f58a1f]"
                  />
                  <Calendar className="absolute right-2 top-[7px] text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-700 block mb-1">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => handleChangeRaw('password', e.target.value)}
                    className="w-full rounded border px-3 h-9 pr-9 focus:outline-none focus:ring-1 focus:ring-[#f58a1f]"
                    placeholder="Nhập Mật khẩu"
                  />
                  <button 
                    type="button"
                    onClick={()=>setShowPwd(s=>!s)}
                    className="absolute right-2 top-[7px] text-gray-500 hover:text-gray-700"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-700 block mb-1">Nhập lại mật khẩu</label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => handleChangeRaw('confirmPassword', e.target.value)}
                    className="w-full rounded border px-3 h-9 pr-9 focus:outline-none focus:ring-1 focus:ring-[#f58a1f]"
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={()=>setShowConfirmPwd(s=>!s)}
                    className="absolute right-2 top-[7px] text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="col-span-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={e => handleChangeRaw('agreeToTerms', e.target.checked)}
                    className="mt-1 text-[#f58a1f] focus:ring-[#f58a1f] rounded"
                  />
                  <span className="text-sm select-none">
                    Bằng việc đăng ký tài khoản, tôi đồng ý với{' '}
                    <a href="#" className="text-[#f58a1f] hover:underline">Điều khoản dịch vụ</a>
                    {' '}và{' '}
                    <a href="#" className="text-[#f58a1f] hover:underline">Chính sách bảo mật</a>
                    {' '}của Only Cinema.
                  </span>
                </label>
              </div>

              <div className="col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#f58a1f] hover:bg-[#f07a00] text-white font-medium h-10 rounded transition-colors disabled:opacity-50"
                >
                  HOÀN THÀNH
                </button>
              </div>

              <div className="col-span-2 text-center">
                <span className="text-sm">Bạn đã có tài khoản?{' '}</span>
                <button type="button" onClick={onClose} className="text-[#f58a1f] text-sm hover:underline">
                  Đăng nhập
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
       <LoadingOverlay isLoading={isLoading} message="Đang tạo tài khoản..." />
    </div>
  )
}
