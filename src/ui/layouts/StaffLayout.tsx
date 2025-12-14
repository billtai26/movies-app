import React, { useState } from "react"; // Bỏ useEffect
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DarkToggle from "../components/DarkToggle";
import { useAuth } from "../../store/auth";
import {
  ClipboardCheck,
  Ticket,
  RefreshCw,
  Utensils,
  FileWarning,
  Edit3,
  Percent,
  Menu,
  Film,
} from "lucide-react";

export default function StaffLayout() {
  const { logout } = useAuth(); // Bỏ role ở đây vì Router đã chặn rồi
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  // --- ĐÃ XÓA useEffect CHECK QUYỀN TẠI ĐÂY ĐỂ TRÁNH XUNG ĐỘT ---

  // Danh sách menu bên trái
  const items = [
    { to: "/staff", label: "Tổng quan", icon: <ClipboardCheck size={16} /> },
    { to: "/staff/checkin", label: "Check-in vé", icon: <Ticket size={16} /> },
    { to: "/staff/booking", label: "Đặt vé tại quầy", icon: <Film size={16} /> },
    { to: "/staff/seat-change", label: "Đổi ghế tại quầy", icon: <RefreshCw size={16} /> },
    { to: "/staff/combos", label: "Xử lý combo", icon: <Utensils size={16} /> },
    { to: "/staff/reports", label: "Báo cáo sự cố", icon: <FileWarning size={16} /> },
    { to: "/staff/order-edit", label: "Sửa đơn hàng", icon: <Edit3 size={16} /> },
    { to: "/staff/promo", label: "Ưu đãi tại rạp", icon: <Percent size={16} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* === SIDEBAR === */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg dark:bg-gray-800 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar items={items} />
      </aside>

      {/* Overlay (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* === MAIN === */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* HEADER */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900 md:justify-end">
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setOpen((v) => !v)}
            >
              <Menu size={20} />
            </button>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              Cinesta Panel
            </span>
          </div>

          <div className="flex items-center gap-3 mr-6">
            <button
              className="btn-outline text-sm px-3 py-1"
              onClick={() => {
                logout();
                nav("/auth/login");
              }}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto flex justify-center">
          <div className="w-full max-w-6xl md:max-w-[calc(100vw-16rem)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
