import React, { useEffect, useState } from "react";
import { seedAll } from "../../../lib/seed";
import { useCollection } from "../../../lib/mockCrud";

interface Report {
  id: number;
  staff: string;
  title: string;
  content: string;
  status: "Chờ duyệt" | "Đã duyệt" | "Từ chối";
  time: string;
}

export default function Reports() {
  // --- Phần thống kê vé ---
  useEffect(() => {
    seedAll();
  }, []);
  const { rows: tickets } = useCollection<any>("tickets");
  const total = tickets.length;
  const done = tickets.filter((t) => t.status === "done").length;

  // --- Phần báo cáo sự cố ---
  const [reports, setReports] = useState<Report[]>([]);
  const [staffName, setStaffName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Lấy báo cáo đã lưu (nếu có)
  useEffect(() => {
    const saved = localStorage.getItem("staffReports");
    if (saved) setReports(JSON.parse(saved));
  }, []);

  // Cập nhật localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem("staffReports", JSON.stringify(reports));
  }, [reports]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !title || !content)
      return alert("Vui lòng nhập đầy đủ thông tin!");
    const newReport: Report = {
      id: reports.length + 1,
      staff: staffName,
      title,
      content,
      status: "Chờ duyệt",
      time: new Date().toLocaleString(),
    };
    setReports([...reports, newReport]);
    setTitle("");
    setContent("");
    alert("✅ Đã gửi báo cáo lên hệ thống!");
  };

  return (
    <div className="space-y-10">
      {/* --- Phần thống kê vé --- */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm opacity-70">Tổng vé</div>
          <div className="text-3xl font-bold">{total}</div>
        </div>
        <div className="card">
          <div className="text-sm opacity-70">Đã vào</div>
          <div className="text-3xl font-bold text-green-500">{done}</div>
        </div>
        <div className="card">
          <div className="text-sm opacity-70">Chờ</div>
          <div className="text-3xl font-bold text-yellow-500">
            {total - done}
          </div>
        </div>
      </div>

      {/* --- Phần form gửi báo cáo sự cố --- */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md w-full">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Báo cáo sự cố
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Tên nhân viên
            </label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Nhập tên của bạn"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-800 text-gray-800 dark:text-white 
                         px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Tiêu đề
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Máy in vé bị lỗi"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-800 text-gray-800 dark:text-white 
                         px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Nội dung chi tiết
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả chi tiết sự cố..."
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-800 text-gray-800 dark:text-white 
                         px-3 py-2 h-28 outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Gửi báo cáo
          </button>
        </form>
      </div>

      {/* --- Danh sách báo cáo đã gửi --- */}
      {reports.length > 0 && (
        <div className="max-w-4xl">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
            Báo cáo đã gửi
          </h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Tiêu đề</th>
                  <th className="px-4 py-2">Trạng thái</th>
                  <th className="px-4 py-2">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-t dark:border-gray-700">
                    <td className="px-4 py-2">{r.id}</td>
                    <td className="px-4 py-2">{r.title}</td>
                    <td className="px-4 py-2">{r.status}</td>
                    <td className="px-4 py-2">{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
