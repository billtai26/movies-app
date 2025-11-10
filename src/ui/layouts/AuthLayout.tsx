import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function AuthLayout() {
  const location = useLocation();
  const isLogin = location.pathname.includes("login");

  return (
    <div className="relative min-h-screen overflow-hidden bg-aurora text-white flex items-center justify-center transition-all duration-700 px-4">
      {/* Hiệu ứng ánh sáng trung tâm */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]"></div>

      <div
        className="
          relative z-10 flex flex-col md:flex-row w-full max-w-6xl
          min-h-[600px] rounded-3xl overflow-hidden shadow-2xl
          backdrop-blur-xl border border-white/10
        "
      >
        {/* Bên giới thiệu */}
        <motion.div
          key={isLogin ? "left" : "right"}
          initial={{ x: isLogin ? "-100%" : "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isLogin ? "-100%" : "100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`flex-1 flex flex-col justify-center text-center md:text-left items-center md:items-start p-8 sm:p-10 md:p-12 ${
            isLogin
              ? "bg-gradient-to-br from-indigo-900/70 via-purple-900/50 to-gray-900/60"
              : "bg-gradient-to-br from-purple-900/60 via-blue-900/50 to-gray-900/70"
          }`}
        >
          <div className="max-w-md space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-400 leading-tight">
              {isLogin ? "Chào mừng trở lại 🎬" : "Tham gia Only Cinema 🌟"}
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {isLogin
                ? "Đăng nhập để đặt vé, xem lịch chiếu và nhận ưu đãi đặc biệt chỉ dành cho bạn."
                : "Tạo tài khoản để theo dõi phim yêu thích, đặt vé nhanh chóng và tận hưởng thế giới điện ảnh tuyệt vời."}
            </p>
          </div>
        </motion.div>

        {/* Bên form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 bg-black/10 md:bg-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ x: isLogin ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isLogin ? "100%" : "-100%", opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-full max-w-xs sm:max-w-sm md:max-w-md"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
