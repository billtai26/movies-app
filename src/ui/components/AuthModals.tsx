import React from 'react'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import ForgotPasswordModal from './ForgotPasswordModal'
import ResetPasswordModal from './ResetPasswordModal'

interface Props {
  loginOpen: boolean
  onLoginClose: () => void
  onLoginSuccess?: () => void
  resetOpen?: boolean
  resetToken?: string | null
  onResetClose?: () => void
}

export default function AuthModals({ loginOpen, onLoginClose, onLoginSuccess, resetOpen = false, resetToken = null, onResetClose }: Props) {
  const [showRegister, setShowRegister] = React.useState(false)
  const [showForgotPassword, setShowForgotPassword] = React.useState(false)

  const handleRegisterClick = () => {
    onLoginClose()
    setShowRegister(true)
  }

  const handleForgotPasswordClick = () => {
    onLoginClose()
    setShowForgotPassword(true)
  }

  return (
    <>
      <LoginModal 
        open={loginOpen} 
        onClose={onLoginClose}
        onRegisterClick={handleRegisterClick}
        onForgotPasswordClick={handleForgotPasswordClick}
        onLoginSuccess={onLoginSuccess}
      />
      <RegisterModal 
        open={showRegister} 
        onClose={() => setShowRegister(false)} 
      />
      <ForgotPasswordModal 
        open={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
      <ResetPasswordModal
        open={!!resetOpen}
        token={resetToken || undefined}
        onClose={onResetClose || (()=>{})}
        onLoginOpen={onLoginClose}
      />
    </>
  )
}