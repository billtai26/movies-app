import { useState, useEffect } from 'react';

// Hook tùy chỉnh để "trì hoãn" một giá trị
export function useDebounce<T>(value: T, delay: number): T {
  // State để lưu giá trị đã trì hoãn
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Chỉ cập nhật giá trị đã trì hoãn sau khi hết 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Hủy bỏ timeout nếu 'value' hoặc 'delay' thay đổi
    // (nghĩa là người dùng vẫn đang gõ)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Chỉ chạy lại effect nếu value hoặc delay thay đổi

  return debouncedValue;
}
