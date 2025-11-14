import React, { useEffect, useState } from "react";
import { useCollection } from "../../../lib/mockCrud";

import toast from "react-hot-toast";

export default function CheckIn() {
  const { rows: tickets, update } = useCollection<any>("tickets");
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {

    setTimeout(() => setReady(true), 200);
  }, []);

  // ✅ Toggle trạng thái check-in
  const toggleStatus = (t: any) => {
    const newStatus = t.status === "done" ? "pending" : "done";
    const now = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    update(t.id, {
      status: newStatus,
      checkinTime: newStatus === "done" ? now : null,
    });

    toast.success(
      newStatus === "done" ? "Đã đánh dấu là ĐÃ VÀO" : "Đã đổi lại thành CHƯA VÀO"
    );
  };

  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.movie.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"
        ? true
        : filter === "done"
        ? t.status === "done"
        : t.status !== "done";
    return matchSearch && matchFilter;
  });

  if (!ready)
    return (
      <div className="text-gray-400 dark:text-gray-500 p-4">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Quét vé / Check-in
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Tìm theo mã vé hoặc tên phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chưa check-in</option>
            <option value="done">Đã check-in</option>
          </select>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          Không có vé phù hợp.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 transition"
            >
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {t.code}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t.movie} — Ghế: {t.seats}
                </div>
                {t.checkinTime && (
                  <div className="text-xs text-green-500 mt-1">
                    Đã check-in lúc {t.checkinTime}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => toggleStatus(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    t.status === "done"
                      ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                      : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                  }`}
                >
                  {t.status === "done" ? "Đã vào" : "Chưa vào"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
