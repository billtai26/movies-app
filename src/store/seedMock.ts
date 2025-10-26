export function seedMockOnce() {
  try {
    if (!localStorage.getItem('__seeded__')) {
      // staff comments
      if (!localStorage.getItem('staff_comments')) {
        localStorage.setItem('staff_comments', JSON.stringify([
          { id: '1', user: 'Minh', movie: 'Avengers', content: 'Phim quá hay!', status: 'visible', createdAt: new Date().toISOString() },
          { id: '2', user: 'Hà', movie: 'Inside Out 2', content: 'Cảm động thật sự', status: 'visible', createdAt: new Date().toISOString() },
          { id: '3', user: 'Long', movie: 'Deadpool 3', content: 'Cười xỉu luôn 😂', status: 'hidden', createdAt: new Date().toISOString() }
        ]))
      }
      // admin reports (from staff)
      if (!localStorage.getItem('admin_staff_reports')) {
        localStorage.setItem('admin_staff_reports', JSON.stringify([
          { id: '1', staff: 'Tuấn', message: 'Máy in quét vé bị lỗi', status: 'Chưa duyệt', createdAt: new Date().toISOString() },
          { id: '2', staff: 'Linh', message: 'Khách không nhận được QR code', status: 'Đã duyệt', createdAt: new Date().toISOString() }
        ]))
      }
      localStorage.setItem('__seeded__', '1')
    }
  } catch {}
}