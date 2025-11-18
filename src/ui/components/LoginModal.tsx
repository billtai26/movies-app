import React from 'react'
import { useAuth } from '../../store/auth'
import { api } from '../../lib/api'
import { Eye, EyeOff, X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onRegisterClick: () => void
  onForgotPasswordClick: () => void
  onLoginSuccess?: () => void
}

export default function LoginModal({ open, onClose, onRegisterClick, onForgotPasswordClick, onLoginSuccess }: Props) {
  const login = useAuth(s=>s.login)
  const [email,setEmail] = React.useState('')
  const [password,setPassword] = React.useState('')
  const [showPwd,setShowPwd] = React.useState(false)
  const [error,setError] = React.useState('')
  const [composing, setComposing] = React.useState(false)
  const [pwdFieldError, setPwdFieldError] = React.useState('')
  const toTelex = (s:string)=>{
    let out = ''
    let tonePending = ''
    const flushTone = () => { if (tonePending) { out += tonePending; tonePending=''; } }
    const isLetter = (c:string)=> /[A-Za-z]/.test(c)

    for (const ch of s){
      const code = ch.codePointAt(0) || 0
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

  const handlePwdBeforeInput = (e:any)=>{
    const ev: any = e?.nativeEvent
    const data = ev?.data
    if (typeof data === 'string' && data.length > 0){
      e.preventDefault()
      setPassword(p=> p + toTelex(data))
    }
  }
  const handlePwdPaste = (e:any)=>{
    const txt = e.clipboardData?.getData?.('text') || ''
    if (txt){ e.preventDefault(); setPassword(p=> p + toTelex(txt)) }
  }
  const containsAccent = (s:string)=>{
    const base = s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d')
    return base !== s
  }
  

  React.useEffect(()=>{
    if(!open){ setEmail(''); setPassword(''); setShowPwd(false); setError(''); setPwdFieldError('') }
  },[open])

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault()
    if(!email){ alert('⚠️ Vui lòng nhập email'); return }
    if(!password){ setPwdFieldError('Mật khẩu không được để trống!'); return }
    try{
      const data = await api.login(email, password)
      if (!data || !data.token){ throw new Error((data && data.message) || 'Đăng nhập thất bại') }
      const name = data.user?.name || email.split('@')[0]
      const avatarUrl = data.user?.avatar || `https://i.pravatar.cc/150?u=${email}`
      useAuth.getState().setSession({ token: data.token, name, email, avatar: avatarUrl, role: 'user' })
    }catch(err:any){
      setError('Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại email và mật khẩu.')
      return
    }
    onClose()
    // Gọi callback sau khi đăng nhập thành công
    onLoginSuccess?.()
  }

  if(!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-[420px] bg-white rounded-lg shadow-lg p-6">
        <button className="absolute right-3 top-3 text-gray-500" onClick={onClose} aria-label="close">
          <X />
        </button>
        <div className="flex flex-col items-center gap-3">
          {/* <img src="/images/login-banner.png" alt="banner" className="w-40 h-32 object-contain" /> */}
          <h3 className="text-lg font-semibold">Đăng Nhập Tài Khoản</h3>
        </div>
        {error && (
          <p className="mt-3 text-center text-red-600 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" placeholder="Nhập Email" />
          </div>
          <div>
            <label className="text-sm text-gray-700">Mật khẩu</label>
              <div className="mt-1 relative">
              <input
                type={showPwd? 'text':'password'}
                value={password}
                onCompositionStart={()=>setComposing(true)}
                onCompositionEnd={()=>setComposing(false)}
                onKeyDown={e=>{
                  if (!composing) return
                  const k = e.key
                  const accentKeys = ['s','f','r','x','j','w','d','S','F','R','X','J','W','D']
                  if (accentKeys.includes(k)){
                    e.preventDefault()
                    setPassword(p=> p + k)
                  }
                }}
                onBeforeInput={handlePwdBeforeInput}
                onPaste={handlePwdPaste}
                onChange={e=> { setPassword(e.target.value); if (pwdFieldError && e.target.value) setPwdFieldError('') }}
                className={`w-full rounded border px-3 py-2 pr-10 ${pwdFieldError? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Nhập Mật khẩu"
              />
              <button type="button" onClick={()=>setShowPwd(s=>!s)} className="absolute right-2 top-2 text-gray-500" title={showPwd? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                {showPwd? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              </div>
              {pwdFieldError && <p className="text-xs text-red-600 mt-1">{pwdFieldError}</p>}
            </div>
          <div>
            <button type="submit" className="w-full bg-[#f58a1f] hover:bg-[#f07a00] text-white font-medium px-4 py-2 rounded">ĐĂNG NHẬP</button>
          </div>
          <div className="text-center text-sm">
            <button 
              type="button"
              onClick={onForgotPasswordClick}
              className="text-[#f58a1f] hover:text-[#f07a00]"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="mt-2 text-center text-sm">
            Bạn chưa có tài khoản? <button type="button" className="text-[#f58a1f]" onClick={onRegisterClick}>Đăng ký</button>
          </div>
        </form>
      </div>
    </div>
  )
}
