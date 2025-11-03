import React from 'react'
import { useNotifications } from './Notification'

// Demo component to test notifications
export const NotificationDemo: React.FC = () => {
  const { addNotification } = useNotifications()

  const showSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Thành công!',
      message: 'Thao tác đã được thực hiện thành công.',
      duration: 3000
    })
  }

  const showError = () => {
    addNotification({
      type: 'error',
      title: 'Lỗi!',
      message: 'Đã xảy ra lỗi trong quá trình xử lý.',
      duration: 5000
    })
  }

  const showWarning = () => {
    addNotification({
      type: 'warning',
      title: 'Cảnh báo!',
      message: 'Vui lòng kiểm tra lại thông tin.',
      duration: 4000
    })
  }

  const showInfo = () => {
    addNotification({
      type: 'info',
      title: 'Thông tin',
      message: 'Đây là thông báo thông tin.',
      duration: 3000
    })
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex gap-2">
      <button onClick={showSuccess} className="btn-primary text-xs px-3 py-1">
        Success
      </button>
      <button onClick={showError} className="btn-outline text-xs px-3 py-1">
        Error
      </button>
      <button onClick={showWarning} className="btn-outline text-xs px-3 py-1">
        Warning
      </button>
      <button onClick={showInfo} className="btn-outline text-xs px-3 py-1">
        Info
      </button>
    </div>
  )
}
