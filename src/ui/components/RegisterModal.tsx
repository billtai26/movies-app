import React from 'react'
import { useAuth } from '../../store/auth'
import { api } from '../../lib/api'
import { Eye, EyeOff, X, Calendar, CheckCircle2 } from 'lucide-react'

export default function RegisterModal({ open, onClose }:{ open:boolean; onClose:()=>void }){
  const login = useAuth(s=>s.login)
  const [formData, setFormData] = React.useState({
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
  const [showPwd, setShowPwd] = React.useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = React.useState(false)
  const [composingPwd, setComposingPwd] = React.useState(false)
  const [composingConfirm, setComposingConfirm] = React.useState(false)
  const normalizeNoAccent = (s:string)=> s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d')
  const toTelex = (s:string)=>{
    let out = ''
    let tonePending = ''
    const flushTone = () => { if (tonePending) { out += tonePending; tonePending=''; } }
    const isLetter = (c:string)=> /[A-Za-z]/.test(c)
    for (const ch of s){
      const isBoundary = !(isLetter(ch) || ch === 'đ' || ch === 'Đ')
      if (isBoundary){ flushTone(); out += ch; continue }
      if (ch === 'đ') { out += 'dd'; continue }
      if (ch === 'Đ') { out += 'DD'; continue }
      const d = ch.normalize('NFD')
      const base = d[0]
      let add = ''
      let tone = ''
      for (let i=1;i<d.length;i++){
        const m = d[i]
        if (m==='\u0301') tone='s'
        else if (m==='\u0300') tone='f'
        else if (m==='\u0309') tone='r'
        else if (m==='\u0303') tone='x'
        else if (m==='\u0323') tone='j'
        else if (m==='\u0302'){ if (/^[aAeEoO]$/.test(base)) add += base.toLowerCase() }
        else if (m==='\u0306'){ if (/^[aA]$/.test(base)) add += 'w' }
        else if (m==='\u031B'){ if (/^[oOuU]$/.test(base)) add += 'w' }
      }
      out += base.replace(/[ÂÊÔƠƯĂ]/g, c=>c.toLowerCase()) + add
      if (tone) tonePending = tone
    }
    flushTone()
    return out
  }
  

  // 2. Thêm state mới để quản lý màn hình "Thành công"
  const [isSuccess, setIsSuccess] = React.useState(false)

  React.useEffect(()=>{
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
      // 3. Reset lại state "Thành công" khi modal đóng
      setIsSuccess(false)
    }
  },[open])

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault()
    
    // Validate required fields
    if(!formData.fullName.trim()){
      alert('⚠️ Vui lòng nhập họ và tên')
      return
    }
    
    if(formData.fullName.trim().length < 2){
      alert('⚠️ Họ và tên phải có ít nhất 2 ký tự')
      return
    }

    if(!formData.userName.trim()){
      alert('⚠️ Vui lòng nhập username')
      return
    }
    
    if(formData.userName.trim().length < 3){
      alert('⚠️ Username phải có ít nhất 3 ký tự')
      return
    }
    
    // Email validation
    if(!formData.email.trim()){
      alert('⚠️ Vui lòng nhập email')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!emailRegex.test(formData.email)){
      alert('⚠️ Email không đúng định dạng')
      return
    }
    
    // Phone validation
    if(!formData.phone.trim()){
      alert('⚠️ Vui lòng nhập số điện thoại')
      return
    }
    
    const phoneRegex = /^0[0-9]{9,10}$/
    if(!phoneRegex.test(formData.phone)){
      alert('⚠️ Số điện thoại phải có 10-11 số và bắt đầu bằng số 0')
      return
    }
    
    // Gender validation
    if(!formData.gender){
      alert('⚠️ Vui lòng chọn giới tính')
      return
    }
    
    // Birth date validation
    if(!formData.birthDate){
      alert('⚠️ Vui lòng chọn ngày sinh')
      return
    }
    
    const birthYear = new Date(formData.birthDate).getFullYear()
    const currentYear = new Date().getFullYear()
    const age = currentYear - birthYear
    
    if(age < 13){
      alert('⚠️ Bạn phải từ 13 tuổi trở lên để đăng ký')
      return
    }
    
    if(age > 100){
      alert('⚠️ Ngày sinh không hợp lệ')
      return
    }
    
    // Password validation
    if(!formData.password){
      alert('⚠️ Vui lòng nhập mật khẩu')
      return
    }
    
    if(formData.password.length < 6){
      alert('⚠️ Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    const sp = toTelex(formData.password)
    if (sp !== formData.password){ setFormData(d=>({...d, password: sp})); alert('⚠️ Mật khẩu không được chứa dấu'); return }
    
    // Confirm password validation
    if(!formData.confirmPassword){
      alert('⚠️ Vui lòng nhập lại mật khẩu')
      return
    }
    const scp = toTelex(formData.confirmPassword)
    if (scp !== formData.confirmPassword){ setFormData(d=>({...d, confirmPassword: scp})); alert('⚠️ Mật khẩu không được chứa dấu'); return }
    
    if(formData.password !== formData.confirmPassword){
      alert('⚠️ Mật khẩu nhập lại không khớp')
      return
    }
    
    // Terms agreement validation
    // if(!formData.agreeToTerms){
    //   alert('⚠️ Vui lòng đồng ý với điều khoản dịch vụ')
    //   return 
    // }

    try{
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
      // 4. Thay vì alert và close, hãy set state "Thành công"
      setIsSuccess(true)
    }catch(err:any){
      alert(`Đăng ký thất bại: ${err?.response?.data?.message || err?.message || 'Vui lòng thử lại.'}`)
    }
  }

  if(!open) return null

  // 5. Render có điều kiện: Hoặc màn hình thành công, hoặc form đăng ký
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50" 
        // Không cho bấm ra ngoài để đóng khi màn hình thành công hiện ra
        onClick={isSuccess ? undefined : onClose} 
      />

      {isSuccess ? (
        // --- NẾU THÀNH CÔNG: HIỂN THỊ MÀN HÌNH NÀY ---
        <div className="relative z-10 w-[480px] bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
          <CheckCircle2 size={64} className="text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Đăng Ký Thành Công!</h3>
          
          {/* 6. Hiển thị nội dung thông báo từ code FE (fallback) */}
          <p className="text-sm text-gray-700 mb-6">
            🎉 Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản!
          </p>

          <button
            // Nút này sẽ đóng modal
            onClick={onClose} 
            className="w-full bg-[#f58a1f] hover:bg-[#f07a00] text-white font-medium h-10 rounded transition-colors"
          >
            HOÀN TẤT
          </button>
        </div>

      ) : (
        // --- NẾU CHƯA THÀNH CÔNG: HIỂN THỊ FORM NHƯ CŨ ---
        <div className="relative z-10 w-[480px] bg-white rounded-lg shadow-lg p-6">
          <button className="absolute right-3 top-3 text-gray-500" onClick={onClose} aria-label="close">
            <X />
          </button>
          <div className="flex flex-col items-center mb-4">
            {/* <img src="/images/login-banner.png" alt="banner" className="w-40 h-32 object-contain" /> */}
            <h3 className="text-lg font-semibold">Đăng Ký Tài Khoản</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="col-span-2">
                <label className="text-sm text-gray-700 block mb-1">Họ và tên</label>
                <input 
                  value={formData.fullName} 
                  onChange={e=>setFormData(d=>({...d, fullName: e.target.value}))}
                  className="w-full rounded border px-3 h-9" 
                  placeholder="Nhập Họ và tên" 
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-700 block mb-1">Username</label>
                <input 
                  value={formData.userName} 
                  onChange={e=>setFormData(d=>({...d, userName: e.target.value}))}
                  className="w-full rounded border px-3 h-9" 
                  placeholder="Nhập username" 
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-700 block mb-1">Email</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={e=>setFormData(d=>({...d, email: e.target.value}))}
                  className="w-full rounded border px-3 h-9"
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
                    setFormData(d=>({...d, phone: value}))
                  }}
                  className="w-full rounded border px-3 h-9"
                  placeholder="Nhập Số điện thoại (VD: 0901234567)"
                  maxLength={11}
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 block mb-1">Giới tính</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="Nam"
                      checked={formData.gender === 'Nam'}
                      onChange={e=>setFormData(d=>({...d, gender: e.target.value}))}
                      className="text-[#f58a1f] focus:ring-[#f58a1f]"
                    />
                    <span className="text-sm">Nam</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="Nữ"
                      checked={formData.gender === 'Nữ'}
                      onChange={e=>setFormData(d=>({...d, gender: e.target.value}))}
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
                    onChange={e=>setFormData(d=>({...d, birthDate: e.target.value}))}
                    className="w-full rounded border px-3 h-9 pr-9"
                    placeholder="Ngày/Tháng/Năm"
                  />
                  <Calendar className="absolute right-2 top-[7px] text-gray-400" size={18} />
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-700 block mb-1">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={formData.password}
                    onCompositionStart={()=>setComposingPwd(true)}
                    onCompositionEnd={()=> setComposingPwd(false)}
                    onKeyDown={e=>{
                      if (!composingPwd) return
                      const k = e.key
                      const accentKeys = ['s','f','r','x','j','w','d','S','F','R','X','J','W','D']
                      if (accentKeys.includes(k)){
                        e.preventDefault()
                        setFormData(d=>({...d, password: d.password + k}))
                      }
                    }}
                    onBeforeInput={(e:any)=>{ const t=e?.nativeEvent?.data; if(typeof t==='string'&&t.length>0){ e.preventDefault(); setFormData(d=>({...d, password: d.password + toTelex(t)})) } }}
                    onPaste={(e:any)=>{ const txt=e.clipboardData?.getData?.('text')||''; if(txt){ e.preventDefault(); setFormData(d=>({...d, password: d.password + toTelex(txt)})) } }}
                    onChange={e=> setFormData(d=>({...d, password: e.target.value}))}
                    className="w-full rounded border px-3 h-9 pr-9"
                    placeholder="Nhập Mật khẩu"
                  />
                  <button 
                    type="button"
                    onClick={()=>setShowPwd(s=>!s)}
                    className="absolute right-2 top-[7px] text-gray-500"
                    title={showPwd? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPwd ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-700 block mb-1">Nhập lại mật khẩu</label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onCompositionStart={()=>setComposingConfirm(true)}
                    onCompositionEnd={()=> setComposingConfirm(false)}
                    onKeyDown={e=>{
                      if (!composingConfirm) return
                      const k = e.key
                      const accentKeys = ['s','f','r','x','j','w','d','S','F','R','X','J','W','D']
                      if (accentKeys.includes(k)){
                        e.preventDefault()
                        setFormData(d=>({...d, confirmPassword: d.confirmPassword + k}))
                      }
                    }}
                    onBeforeInput={(e:any)=>{ const t=e?.nativeEvent?.data; if(typeof t==='string'&&t.length>0){ e.preventDefault(); setFormData(d=>({...d, confirmPassword: d.confirmPassword + toTelex(t)})) } }}
                    onPaste={(e:any)=>{ const txt=e.clipboardData?.getData?.('text')||''; if(txt){ e.preventDefault(); setFormData(d=>({...d, confirmPassword: d.confirmPassword + toTelex(txt)})) } }}
                    onChange={e=> setFormData(d=>({...d, confirmPassword: e.target.value}))}
                    className="w-full rounded border px-3 h-9 pr-9"
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={()=>setShowConfirmPwd(s=>!s)}
                    className="absolute right-2 top-[7px] text-gray-500"
                    title={showConfirmPwd? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPwd ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              <div className="col-span-2">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={e=>setFormData(d=>({...d, agreeToTerms: e.target.checked}))}
                    className="mt-1 text-[#f58a1f] focus:ring-[#f58a1f] rounded"
                  />
                  <span className="text-sm">
                    Bằng việc đăng ký tài khoản, tôi đồng ý với{' '}
                    <a href="#" className="text-[#f58a1f]">Điều khoản dịch vụ</a>
                    {' '}và{' '}
                    <a href="#" className="text-[#f58a1f]">Chính sách bảo mật</a>
                    {' '}của Only Cinema.
                  </span>
                </label>
              </div>

              <div className="col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={!formData.agreeToTerms}
                  className={`w-full font-medium h-10 rounded transition-colors ${
                    formData.agreeToTerms 
                      ? 'bg-[#f58a1f] hover:bg-[#f07a00] text-white cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  HOÀN THÀNH
                </button>
              </div>

              <div className="col-span-2 text-center">
                <span className="text-sm">Bạn đã có tài khoản?{' '}</span>
                <button type="button" onClick={onClose} className="text-[#f58a1f] text-sm">
                  Đăng nhập
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}