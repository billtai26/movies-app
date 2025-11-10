import React, { useState } from "react";
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
} from "lucide-react";

export default function StaffLayout() {
  const items = [
    { to: "/staff", label: "Tổng quan", icon: <ClipboardCheck size={16} /> },
    { to: "/staff/checkin", label: "Check-in vé", icon: <Ticket size={16} /> },
    { to: "/staff/seat-change", label: "Đổi ghế tại quầy", icon: <RefreshCw size={16} /> },
    { to: "/staff/combos", label: "Xử lý combo", icon: <Utensils size={16} /> },
    { to: "/staff/reports", label: "Báo cáo sự cố", icon: <FileWarning size={16} /> },
    { to: "/staff/order-edit", label: "Sửa đơn hàng", icon: <Edit3 size={16} /> },
    { to: "/staff/promo", label: "Ưu đãi tại rạp", icon: <Percent size={16} /> },
  ];

  const { logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar: LUÔN fixed, KHÔNG md:static */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 dark:bg-gray-800
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar items={items} />
      </aside>

      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main: bù đúng 16rem khi >= md */}
      <div className="flex flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white p-3 dark:border-gray-700 dark:bg-gray-900 md:justify-end">
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setOpen(!open)}
            >
              <Menu size={20} />
            </button>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              Only Cinema Panel
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DarkToggle />
            <button
              className="btn-outline"
              onClick={() => { logout(); nav("/auth/login"); }}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-visible flex justify-center">
          <div className="w-full max-w-6xl md:max-w-[calc(100vw-16rem)]">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}