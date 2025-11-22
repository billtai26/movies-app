import React, { useEffect, useState } from 'react'

interface CountdownProps {
  secondsLeft: number;      
  onExpire?: () => void;    
  autoRun?: boolean; // [NEW] Thêm prop này
}

export default function Countdown({ secondsLeft, onExpire, autoRun = true }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(secondsLeft);

  // [CHANGE]: Luôn cập nhật state nội bộ nếu prop bên ngoài thay đổi
  // (Dùng cho trường hợp Seats.tsx tự quản lý thời gian)
  useEffect(() => {
    setTimeLeft(secondsLeft);
  }, [secondsLeft]);

  useEffect(() => {
    // [CHANGE]: Nếu autoRun = false thì không tự đếm ngược (để Seats.tsx tự lo)
    if (!autoRun) return;

    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onExpire, autoRun]);

  const mm = String(Math.floor(Math.max(0, timeLeft) / 60)).padStart(2, '0');
  const ss = String(Math.max(0, timeLeft) % 60).padStart(2, '0');

  return (
    <div className="rounded-xl bg-gray-900 px-3 py-1 text-white font-mono">
      Giữ ghế: {mm}:{ss}
    </div>
  )
}
