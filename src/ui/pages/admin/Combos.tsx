import React, { useState, useEffect } from "react";
import { useCollection } from "../../../lib/mockCrud";
import { seedAll } from "../../../lib/seed";

export default function AdminCombos() {
  const { rows, create, update, remove } = useCollection<any>("combos");
  const [search, setSearch] = useState("");
  const [filterImage, setFilterImage] = useState(""); // Lọc theo ảnh
  const [editing, setEditing] = useState<any | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", desc: "", image: "" });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    seedAll();
  }, []);

  const filteredRows = rows
    .filter((r: any) =>
      [r.name, r.desc].some((x) =>
        (x || "").toLowerCase().includes(search.toLowerCase())
      )
    )
    .filter((r: any) =>
      filterImage === ""
        ? true
        : filterImage === "yes"
        ? !!r.image
        : !r.image
    );

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = filteredRows.slice(start, end);

  useEffect(() => {
    setPage(1);
  }, [search, filterImage, pageSize]);

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: "", price: "", desc: "", image: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (r: any) => {
    setEditing(r);
    setForm({
      name: r.name,
      price: r.price,
      desc: r.desc || "",
      image: r.image || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (editing) {
      update(editing.id, {
        name: form.name,
        price: Number(form.price),
        desc: form.desc,
        image: form.image,
      });
    } else {
      create({
        name: form.name,
        price: Number(form.price),
        desc: form.desc,
        image: form.image,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Xóa combo này?")) remove(id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) =>
      setForm({ ...form, image: event.target?.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow space-y-5">
      {/* Header + Bộ lọc + Thanh công cụ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Quản lý combo đồ ăn
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          {/* Lọc theo ảnh */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Ảnh:
            </span>
            <select
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800"
              value={filterImage}
              onChange={(e) => setFilterImage(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="yes">Có ảnh</option>
              <option value="no">Không ảnh</option>
            </select>
          </div>

          {/* Dropdown 5/trang */}
          <select
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20].map((n) => (
              <option key={n} value={n}>
                {n} / trang
              </option>
            ))}
          </select>

          {/* Ô tìm kiếm + nút thêm */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm theo tên / mô tả..."
              className="input sm:w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={openAddModal}
              className="btn-primary whitespace-nowrap"
            >
              + Thêm
            </button>
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700 dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="text-left px-3 py-2">Hình ảnh</th>
              <th className="text-left px-3 py-2">Tên combo</th>
              <th className="text-left px-3 py-2">Giá</th>
              <th className="text-left px-3 py-2">Mô tả</th>
              <th className="text-center px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r: any) => (
              <tr
                key={r.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="px-3 py-2">
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-14 h-14 rounded-md object-cover border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-14 h-14 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-md text-gray-400 text-xs">
                      Không ảnh
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">
                  {r.price.toLocaleString("vi-VN")} ₫
                </td>
                <td className="px-3 py-2">{r.desc || "—"}</td>
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setViewing(r)}
                      className="bg-green-500 hover:bg-green-400 text-white px-3 py-1 rounded-md text-xs"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => openEditModal(r)}
                      className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded-md text-xs"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded-md text-xs"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Hiển thị {total === 0 ? 0 : `${start + 1}–${Math.min(end, total)}`} /
          Tổng {total}
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              page <= 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
            }`}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Trang trước
          </button>

          <span className="px-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            {page} / {totalPages}
          </span>

          <button
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              page >= totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
            }`}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* Modal thêm/sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[420px] p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editing ? "Cập nhật combo" : "Thêm combo mới"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Hình ảnh combo
                </label>
                {form.image && (
                  <img
                    src={form.image}
                    alt="preview"
                    className="w-full h-40 object-cover rounded-lg border border-gray-300 dark:border-gray-700 mb-2"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm text-gray-600 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Tên combo
                </label>
                <input
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-transparent"
                  placeholder="Nhập tên combo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Giá (₫)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-transparent"
                  placeholder="Nhập giá combo"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-transparent"
                  placeholder="Mô tả combo"
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-md bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white"
              >
                {editing ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết */}
      {viewing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[420px] p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Chi tiết combo
            </h3>

            <div className="space-y-3">
              {viewing.image && (
                <img
                  src={viewing.image}
                  alt={viewing.name}
                  className="w-full h-40 object-cover rounded-lg border border-gray-300 dark:border-gray-700 mb-2"
                />
              )}

              <div>
                <div className="text-sm text-gray-500">Tên combo</div>
                <div className="font-medium">{viewing.name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Giá</div>
                <div className="font-medium">
                  {Number(viewing.price).toLocaleString("vi-VN")} ₫
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Mô tả</div>
                <div className="font-medium whitespace-pre-wrap">
                  {viewing.desc || "—"}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setViewing(null)}
                className="px-4 py-1.5 rounded-md bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
