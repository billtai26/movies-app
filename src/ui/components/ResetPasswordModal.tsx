import React from 'react'
import { X } from 'lucide-react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'

interface Props {
  open: boolean
  onClose: () => void
  token?: string | null
  onLoginOpen?: () => void
}

export default function ResetPasswordModal({ open, onClose, token, onLoginOpen }: Props) {
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string>('')
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

  const handleBeforeInputPwd = (e:any)=>{
    const ev:any = e?.nativeEvent
    const data = ev?.data
    if (typeof data === 'string' && data.length>0){ 
      e.preventDefault(); 
      setPassword(p=> p + toTelex(data)) 
    }
  }
  const handlePastePwd = (e:any)=>{ 
    const t = e.clipboardData?.getData?.('text')||''; 
    if(t){ 
      e.preventDefault(); 
      setPassword(p=> p + toTelex(t)) 
    } 
  }
  const handleBeforeInputConfirm = (e:any)=>{ 
    const d = e?.nativeEvent?.data; 
    if(typeof d==='string'&&d.length>0){ 
      e.preventDefault(); 
      setConfirmPassword(p=> p + toTelex(d)) 
    } 
  }
  const handlePasteConfirm = (e:any)=>{ 
    const t = e.clipboardData?.getData?.('text')||''; 
    if(t){ 
      e.preventDefault(); 
      setConfirmPassword(p=> p + toTelex(t)) 
    } 
  }
  

  React.useEffect(() => {
    if (!open) {
      setPassword('')
      setConfirmPassword('')
      setSubmitting(false)
      setError('')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) { 
      toast.warning('⚠️ Vui lòng nhập mật khẩu mới'); 
      return 
    }
    if (password.length < 6) { 
      toast.warning('⚠️ Mật khẩu phải có ít nhất 6 ký tự'); 
      return 
    }
    const p1 = toTelex(password)
    const p2 = toTelex(confirmPassword)
    if (p1 !== password || p2 !== confirmPassword) { setPassword(p1); setConfirmPassword(p2); setError('Mật khẩu không được chứa dấu'); return }
    if (password !== confirmPassword) { 
      toast.error('⚠️ Mật khẩu xác nhận không khớp'); 
      return 
    }
    if (!token) { 
      toast.error('⚠️ Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'); 
      return 
    }
    try {
      setSubmitting(true)
      const res = await api.resetPassword(token, password)
      toast.success(res?.message || '✅ Đặt lại mật khẩu thành công!')
      onClose()
      if (onLoginOpen) onLoginOpen()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />

      <div className="relative z-10 w-[400px] bg-white rounded-xl shadow-2xl p-8">
        <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" onClick={onClose} aria-label="close">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Đặt Lại Mật Khẩu</h2>
          <p className="text-sm text-gray-600 text-center">Vui lòng nhập mật khẩu mới của bạn.</p>
        </div>
        {error && (
          <p className="mb-3 text-center text-red-600 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onCompositionStart={()=>setComposingPwd(true)}
              onCompositionEnd={()=> setComposingPwd(false)}
              onKeyDown={e=>{
                if (!composingPwd) return
                const k = e.key
                const accentKeys = ['s','f','r','x','j','w','d','S','F','R','X','J','W','D']
                if (accentKeys.includes(k)){
                  e.preventDefault()
                  setPassword(p=> p + k)
                }
              }}
              onBeforeInput={handleBeforeInputPwd}
              onPaste={handlePastePwd}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="Mật khẩu mới"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onCompositionStart={()=>setComposingConfirm(true)}
              onCompositionEnd={()=> setComposingConfirm(false)}
              onKeyDown={e=>{
                if (!composingConfirm) return
                const k = e.key
                const accentKeys = ['s','f','r','x','j','w','d','S','F','R','X','J','W','D']
                if (accentKeys.includes(k)){
                  e.preventDefault()
                  setConfirmPassword(p=> p + k)
                }
              }}
              onBeforeInput={handleBeforeInputConfirm}
              onPaste={handlePasteConfirm}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#f58a1f] hover:bg-[#e47316] disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-2"
          >
            {submitting ? 'Đang cập nhật...' : 'XÁC NHẬN'}
          </button>
        </form>
      </div>
    </div>
  )
}
