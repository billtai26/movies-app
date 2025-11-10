import React from "react";
import { AlertTriangle } from "lucide-react";
import CrudModal from "./CrudModal";
import { EntitySchema } from "../../types/entities";
import { useCollection } from "../../lib/mockCrud";

export default function CrudTable({
  schema,
  canEdit = true,
  customActions,
}: {
  schema: EntitySchema;
  canEdit?: boolean;
  customActions?: (row: any) => React.ReactNode;
}) {
  const { rows, create, update, remove } = useCollection<any>(schema.name as any);

  // 🟢 dữ liệu hiển thị độc lập với hook gốc
  const [items, setItems] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<any | null>(null);
  const [viewing, setViewing] = React.useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<any | null>(null);

  const [keyword, setKeyword] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  // ✅ chỉ set lại data khi rows thay đổi mà không mở modal
  React.useEffect(() => {
    if (!open && !viewing) setItems(rows);
  }, [rows, open, viewing]);

  const refresh = async () => {
    try {
      const res = await fetch(`http://localhost:8017/api/${schema.name}`);
      const json = await res.json();
      if (json.data) setItems(json.data);
    } catch (err) {
      console.error("❌ Refresh failed:", err);
    }
  };

  // === HANDLERS ===
  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const onEdit = async (r: any) => {
  try {
    const full = schema.fetchOne ? await schema.fetchOne(r.id) : r;
    const mapped = schema.toForm ? schema.toForm(full) : full;
    setEditing(mapped);
    setOpen(true);
  } catch (e) {
    console.error(e);
  }
};

  const onView = async (r: any) => {
  try {
    const full = schema.fetchOne ? await schema.fetchOne(r.id) : r;
    const mapped = schema.toForm ? schema.toForm(full) : full;
    setViewing(mapped);
  } catch (e) {
    console.error(e);
  }
};

  const onSubmit = async (formData: any) => {
    try {
      const payload = schema.toPayload
        ? schema.toPayload(formData, editing)
        : formData;

      if (editing) await update(editing.id, payload);
      else await create(payload);
      
      await refresh();
      setOpen(false);
    } catch (err) {
      console.error("❌ Lỗi khi lưu dữ liệu:", err);
    }
  };

  const onDelete = (r: any) => setConfirmDelete(r);

  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      await remove(confirmDelete.id);
      await refresh();
      setConfirmDelete(null);
    }
  };

  // === FILTER / PAGINATION ===
  const FILTER_KEYS = ["status", "role", "cinema", "type"];
  const availableFilters = FILTER_KEYS.filter((key) =>
    schema.columns.some((c) => c.key === key)
  );
  const [filters, setFilters] = React.useState<Record<string, string>>({});

  const filtered = items
    .filter((r: any) =>
      JSON.stringify(r).toLowerCase().includes(keyword.toLowerCase())
    )
    .filter((r: any) =>
      availableFilters.every((key) =>
        filters[key] ? String(r[key]) === filters[key] : true
      )
    );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageRows = filtered.slice(startIndex, endIndex);

  React.useEffect(() => setPage(1), [keyword, JSON.stringify(filters), pageSize]);

  // === UI ===
  return (
    <div className="card w-full overflow-hidden">
      {/* HEADER */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="text-lg font-semibold">{schema.title}</div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            {availableFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {availableFilters.map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {key === "status"
                        ? "Trạng thái:"
                        : key === "role"
                        ? "Vai trò:"
                        : key === "cinema"
                        ? "Rạp/Cụm:"
                        : key === "type"
                        ? "Loại:"
                        : `${key}:`}
                    </span>
                    <select
                      className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800"
                      value={filters[key] || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, [key]: e.target.value })
                      }
                    >
                      <option value="">Tất cả</option>
                      {[...new Set(items.map((r: any) => r[key]))]
                        .filter(Boolean)
                        .map((v: any) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

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

            <div className="flex items-center gap-2">
              <input
                className="input flex-1 sm:w-56"
                placeholder="Tìm kiếm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {canEdit && (
                <button
                  className="btn-primary whitespace-nowrap"
                  onClick={onCreate}
                >
                  + Thêm
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="hidden md:block overflow-x-auto rounded-xl border dark:border-gray-800">
        <table className="min-w-[700px] w-full text-sm border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {schema.columns
                .filter((c) => !["id", "_id"].includes(c.key))
                .map((c) => (
                  <th
                    key={c.key}
                    className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                  >
                    {c.label}
                  </th>
                ))}
              <th className="px-3 py-2 text-center font-semibold whitespace-nowrap">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody>
            {pageRows.map((r: any) => (
              <tr
                key={r.id}
                className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                {schema.columns
                  .filter((c) => !["id", "_id"].includes(c.key))
                  .map((c) => (
                    <td key={c.key} className="px-3 py-2 align-middle">
                      {String(r[c.key] ?? "")}
                    </td>
                  ))}

                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <div className="flex justify-center gap-2">
                    <button
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                      onClick={() => onView(r)}
                    >
                      Xem
                    </button>
                    {canEdit && (
                      <>
                        <button
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                          onClick={() => onEdit(r)}
                        >
                          Sửa
                        </button>
                        <button
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                          onClick={() => onDelete(r)}
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Hiển thị {total === 0 ? 0 : `${startIndex + 1}–${Math.min(endIndex, total)}`} / Tổng {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              currentPage <= 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
            }`}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            Trang trước
          </button>
          <span className="px-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            {currentPage} / {totalPages}
          </span>
          <button
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              currentPage >= totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
            }`}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* MODALS */}
      {open && (
        <CrudModal
          open={open}
          title={editing ? `Sửa ${schema.title}` : `Thêm ${schema.title}`}
          fields={schema.fields}
          value={editing}
          onClose={() => setOpen(false)}
          onSubmit={onSubmit}
        />
      )}

      {viewing && (
        <CrudModal
          open={!!viewing}
          title={`Chi tiết ${schema.title}`}
          fields={schema.fields}
          value={viewing}
          onClose={() => setViewing(null)}
          onSubmit={() => {}}
          readOnly={true}
        />
      )}

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
              <span className="font-semibold text-red-500">
                {confirmDelete.title ||
                  confirmDelete.name ||
                  confirmDelete.label ||
                  confirmDelete.id}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm shadow-sm"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
