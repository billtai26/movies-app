import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useCollection } from "../../../lib/mockCrud";

export default function AdminCombos() {
  const { rows, create, update, remove } = useCollection<any>("combos");
  const [search, setSearch] = useState("");
  const [filterImage, setFilterImage] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", description: "", imageUrl: "" });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredRows = rows
    .filter((r: any) =>
      [r.name, r.description].some((x) =>
        (x || "").toLowerCase().includes(search.toLowerCase())
      )
    )
    .filter((r: any) =>
      filterImage === ""
        ? true
        : filterImage === "yes"
        ? !!r.imageUrl
        : !r.imageUrl
    );

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = filteredRows.slice(start, end);

  useEffect(() => setPage(1), [search, filterImage, pageSize]);

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: "", price: "", description: "", imageUrl: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (r: any) => {
    setEditing(r);
    setForm({
      name: r.name,
      price: r.price,
      description: r.description || "",
      imageUrl: r.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      imageUrl: form.imageUrl,
    };
    if (editing) await update(editing.id, payload);
    else await create(payload);
    setIsModalOpen(false);
  };

  const handleDelete = (r: any) => setConfirmDelete(r);

  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      await remove(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) =>
      setForm({ ...form, imageUrl: event.target?.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="card w-full overflow-hidden">
      {/* HEADER */}
      <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="text-lg font-semibold">🎬 Quản lý combo đồ ăn</div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          {/* Lọc ảnh */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Ảnh:</span>
            <select
              className="border rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800"
              value={filterImage}
              onChange={(e) => setFilterImage(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="yes">Có ảnh</option>
              <option value="no">Không ảnh</option>
            </select>
          </div>

          {/* Số dòng / trang */}
          <select
            className="border rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20].map((n) => (
              <option key={n} value={n}>
                {n} / trang
              </option>
            ))}
          </select>

          {/* Tìm kiếm + thêm */}
          <div className="flex items-center gap-2">
            <input
              className="input sm:w-56"
              placeholder="Tìm theo tên / mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={openAddModal} className="btn-primary">
              + Thêm
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="hidden md:block overflow-x-auto rounded-xl border dark:border-gray-800">
        <table className="min-w-[700px] w-full text-sm border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800">
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
              <tr key={r.id} className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="px-3 py-2">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
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
                <td className="px-3 py-2">{r.price?.toLocaleString()} ₫</td>
                <td className="px-3 py-2">{r.description || "—"}</td>
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setViewing(r)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => openEditModal(r)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(r)}
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
                <td colSpan={5} className="text-center py-6 text-gray-500 dark:text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[450px] p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editing ? "Sửa combo" : "Thêm combo"}
            </h3>
            <div className="space-y-3">
              <label className="text-sm text-gray-600 dark:text-gray-300 block">
                Ảnh combo
              </label>
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="preview"
                  className="w-full h-40 object-cover rounded-lg border border-gray-300 dark:border-gray-700 mb-2"
                />
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-600 dark:text-gray-300" />
              <input
                className="input w-full"
                placeholder="Tên combo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="number"
                className="input w-full"
                placeholder="Giá combo"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <textarea
                rows={3}
                className="input w-full"
                placeholder="Mô tả combo"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
                Hủy
              </button>
              <button onClick={handleSave} className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white">
                {editing ? "Lưu thay đổi" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận xoá */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[380px] p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={22} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Xác nhận xoá
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
              Bạn có chắc chắn muốn xoá{" "}
              <span className="font-semibold text-red-500">{confirmDelete.name}</span>?
              <br />
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm"
              >
                Xác nhận xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
