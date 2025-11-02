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
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<any | null>(null);
  const [viewing, setViewing] = React.useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<any | null>(null);
  const [keyword, setKeyword] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  // Lọc tự động theo field
  const FILTER_KEYS = ["status", "role", "cinema", "type"];
  const availableFilters = FILTER_KEYS.filter((key) =>
    schema.columns.some((c) => c.key === key)
  );
  const [filters, setFilters] = React.useState<Record<string, string>>({});

  // Tìm kiếm & lọc
  const filtered = rows
    .filter((r: any) =>
      JSON.stringify(r).toLowerCase().includes(keyword.toLowerCase())
    )
    .filter((r: any) =>
      availableFilters.every((key) =>
        filters[key] ? String(r[key]) === filters[key] : true
      )
    );

  // Phân trang
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageRows = filtered.slice(startIndex, endIndex);

  React.useEffect(() => {
    setPage(1);
  }, [keyword, JSON.stringify(filters), pageSize]);

  // CRUD
  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const onEdit = (r: any) => {
    setEditing(r);
    setOpen(true);
  };
  const onSubmit = (data: any) => {
    if (editing) update(editing.id, data);
    else create(data);
    setOpen(false);
  };
  const onDelete = (r: any) => setConfirmDelete(r);
  const handleConfirmDelete = () => {
    if (confirmDelete) {
      remove(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="card w-full overflow-hidden">
      {/* HEADER */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="text-lg font-semibold">{schema.title}</div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            {/* Lọc */}
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
                      {[...new Set(rows.map((r: any) => r[key]))]
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

            {/* Số dòng / trang */}
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

            {/* Tìm kiếm + Thêm */}
            <div className="flex items-center gap-2">
              <input
                className="input flex-1 sm:w-56"
                placeholder="Tìm kiếm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {canEdit && (
                <button className="btn-primary whitespace-nowrap" onClick={onCreate}>
                  + Thêm
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =============== TABLE (DESKTOP) =============== */}
      <div className="hidden md:block overflow-x-auto rounded-xl border dark:border-gray-800">
        <table className="min-w-[700px] w-full text-sm border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {schema.columns.map((c) => (
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
                {schema.columns.map((c) => (
                  <td key={c.key} className="px-3 py-2 align-middle">
                    {(() => {
                      const value = r[c.key];
                      if (c.key === "poster" || c.key === "imageUrl")
                        return (
                          <img
                            src={value || "https://placehold.co/80x80"}
                            alt=""
                            className="h-14 w-14 object-cover rounded-md border"
                          />
                        );
                      if (c.key === "status") {
                        const map: any = {
                          now: "bg-green-100 text-green-700",
                          coming: "bg-blue-100 text-blue-700",
                          draft: "bg-gray-100 text-gray-700",
                          "Đã duyệt": "bg-green-100 text-green-700",
                          "Chưa duyệt": "bg-gray-100 text-gray-700",
                          "Từ chối": "bg-red-100 text-red-700",
                        };
                        return (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${map[value] || "bg-gray-100 text-gray-700"}`}
                          >
                            {value}
                          </span>
                        );
                      }
                      return String(value ?? "");
                    })()}
                  </td>
                ))}
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <div className="flex justify-center gap-2">
                    <button
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                      onClick={() => setViewing(r)}
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

      {/* =============== CARD MODE (MOBILE) =============== */}
      <div className="block md:hidden space-y-3">
        {pageRows.map((r: any) => (
          <div
            key={r.id}
            className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 shadow-sm"
          >
            {schema.columns.map((c) => (
              <div key={c.key} className="mb-1">
                <span className="font-medium">{c.label}: </span>
                {(() => {
                  const value = r[c.key];
                  if (c.key === "poster" || c.key === "imageUrl")
                    return (
                      <img
                        src={value || "https://placehold.co/100x100"}
                        alt=""
                        className="mt-1 h-20 w-20 object-cover rounded-lg border"
                      />
                    );
                  return <span>{String(value ?? "")}</span>;
                })()}
              </div>
            ))}

            <div className="flex gap-2 mt-2 justify-end">
              <button
                className="flex-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                onClick={() => setViewing(r)}
              >
                Xem
              </button>
              {canEdit && (
                <>
                  <button
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    onClick={() => onEdit(r)}
                  >
                    Sửa
                  </button>
                  <button
                    className="flex-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    onClick={() => onDelete(r)}
                  >
                    Xóa
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Hiển thị{" "}
          {total === 0
            ? 0
            : `${startIndex + 1}–${Math.min(endIndex, total)}`}{" "}
          / Tổng {total}
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

      {/* Modal Thêm / Sửa */}
      <CrudModal
        open={open}
        title={editing ? `Sửa ${schema.title}` : `Thêm ${schema.title}`}
        fields={schema.fields}
        value={editing}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />

      {/* Modal Chi tiết (giao diện đẹp như combo) */}
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

      {/* Modal Xác nhận xoá */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
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
                  confirmDelete.movieTitle ||
                  confirmDelete.cinemaName ||
                  confirmDelete.id}
              </span>
              ?<br />
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm shadow-sm"
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
