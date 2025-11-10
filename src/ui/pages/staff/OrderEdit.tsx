import React, { useEffect, useState } from "react";
import { useCollection } from "../../../lib/mockCrud";
import { seedAll } from "../../../lib/seed";
import CustomSelect from "../../../ui/components/CustomSelect";

export default function OrderEdit() {
  const { rows: orders = [], update, remove } = useCollection<any>("orders");
  const [editing, setEditing] = useState<any | null>(null);
  const [status, setStatus] = useState("pending");
  const [keyword, setKeyword] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    seedAll();
  }, []);

  const handleEdit = (order: any) => {
    setEditing(order);
    setStatus(order.status);
  };

  const handleDelete = (order: any) => {
    if (confirm(`Bạn có chắc muốn xóa đơn #${order.id}?`)) {
      remove(order.id);
      if (editing?.id === order.id) setEditing(null);
    }
  };

  const handleSave = () => {
    if (!editing) return;
    update(editing.id, { status });
    setEditing(null);
  };

  // Search filter
  const filtered = orders.filter(
    (o) =>
      o.id.toString().includes(keyword.toLowerCase()) ||
      o.status.toLowerCase().includes(keyword.toLowerCase())
  );

  // Pagination logic
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = filtered.slice(start, end);

  useEffect(() => {
    setPage(1);
  }, [keyword, pageSize]);

  return (
    <div className="bg-white p-5 rounded-2xl shadow space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Quản lý đơn hàng
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          {/* Số dòng/trang */}
          <select
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20].map((n) => (
              <option key={n} value={n}>
                {n} / trang
              </option>
            ))}
          </select>

          {/* Ô tìm kiếm */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              className="input sm:w-56"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bảng đơn hàng */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-3 py-2">Mã đơn</th>
              <th className="text-left px-3 py-2">Tổng tiền (₫)</th>
              <th className="text-left px-3 py-2">Trạng thái</th>
              <th className="text-center px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((order) => (
              <tr
                key={order.id}
                className="border-t border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="px-3 py-2 font-medium text-gray-900">
                  #{order.id}
                </td>
                <td className="px-3 py-2">
                  {order.total?.toLocaleString("vi-VN")}
                </td>
                <td className="px-3 py-2 capitalize">{order.status}</td>
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(order)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(order)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-gray-500 italic"
                >
                  Không có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <div className="text-sm text-gray-600">
          Hiển thị {total === 0 ? 0 : `${start + 1}–${Math.min(end, total)}`} /
          Tổng {total}
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              page <= 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Trang trước
          </button>

          <span className="px-2 text-sm font-semibold text-gray-700">
            {page} / {totalPages}
          </span>

          <button
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              page >= totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* Form chỉnh sửa */}
      {editing && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="text-base font-semibold mb-2">
            Đang chỉnh sửa đơn{" "}
            <span className="text-blue-500">#{editing.id}</span>
          </div>
          <div className="text-sm text-gray-500 mb-3">
            Tổng: {editing.total?.toLocaleString()}₫ — Trạng thái hiện tại:{" "}
            {editing.status}
          </div>

          <div className="label mb-1">Trạng thái mới</div>
          <div className="max-w-xs">
            <CustomSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: "pending", label: "Chờ xử lý" },
                { value: "paid", label: "Đã thanh toán" },
                { value: "refunded", label: "Hoàn tiền" },
              ]}
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setEditing(null)}
              className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
