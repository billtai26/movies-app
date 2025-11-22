// src/ui/components/LoadingOverlay.tsx
import React from "react";
import { Loader2 } from "lucide-react";

interface Props {
  isLoading: boolean;
  message?: string;
}

export default function LoadingOverlay({ isLoading, message = "Đang xử lý..." }: Props) {
  if (!isLoading) return null;

  return (
    // fixed inset-0: Phủ kín màn hình
    // z-[9999]: Đảm bảo luôn nằm trên cùng (trên cả Modal)
    // bg-black/60: Nền đen mờ
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-fadeIn">
      <div className="bg-gray-900 border border-gray-700 px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 transform transition-all scale-100">
        {/* Icon xoay */}
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        
        {/* Dòng thông báo */}
        <p className="text-white font-medium text-sm tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
}
