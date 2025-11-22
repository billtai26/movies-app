import React from 'react'
import { Navigate, useParams } from 'react-router-dom'

export default function ResetPassword() {
  const { token } = useParams()
  return (
    <Navigate to="/" replace state={{ openReset: true, resetToken: token || '' }} />
  )
}
