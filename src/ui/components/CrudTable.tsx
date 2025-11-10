// src/ui/components/CrudTable.tsx
import React from "react";
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
  const [keyword, setKeyword] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  // ✅ Auto filter fields: status, role, cinema, type
  const FILTER_KEYS = ["status", "role", "cinema", "type"];
  const availableFilters = FILTER_KEYS.filter(
    (key) => schema.columns.some((c) => c.key === key)
  );
  const [filters, setFilters] = React.useState<Record<string, string>>({});

  const filtered = rows
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

  React.useEffect(() => {
    setPage(1);
  }, [keyword, JSON.stringify(filters), pageSize]);

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

  return (
    <div className="card table-wrap w-full overflow-hidden">
      {/* Header + Bộ lọc + Số dòng/trang */}
<div className="mb-4 flex flex-col gap-3">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
    <div className="text-lg font-semibold">{schema.title}</div>

    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
      {/* Bộ lọc ngang */}
      {availableFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {availableFilters.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">
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
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white"
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

      {/* Select 5/trang */}
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

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border w-full">
        <table className="min-w-[700px] w-full text-sm border-collapse">
          <thead className="bg-gray-50">
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
                className="border-t hover:bg-gray-50 transition-colors"
              >
                {schema.columns.map((c) => (
                  <td key={c.key} className="px-3 py-2 align-middle">
                    {(() => {
                      const value = r[c.key];
                      if (c.key === "poster")
                        return (
                          <img
                            src={value}
                            alt=""
                            className="h-10 w-8 object-cover rounded"
                          />
                        );
                      if (c.key === "imageUrl")
                        return (
                          <img
                            src={value || "https://placehold.co/80x80"}
                            alt=""
                            className="h-20 w-20 object-cover rounded-lg border"
                          />
                        );
                      if (c.key === "status") {
                        let color =
                          "bg-gray-200 text-gray-800 hover:bg-gray-300";
                        if (value === "Đã duyệt")
                          color = "bg-green-200 text-green-800 hover:bg-green-300";
                        else if (value === "Từ chối")
                          color = "bg-red-200 text-red-700 hover:bg-red-300";
                        else if (value === "Chưa duyệt")
                          color = "bg-gray-200 text-gray-700 hover:bg-gray-300";
                        return (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors cursor-default ${color}`}
                          >
                            {value}
                          </span>
                        );
                      }
                      if (c.key === "createdAt" && value)
                        return new Date(value).toLocaleString();
                      return String(value ?? "");
                    })()}
                  </td>
                ))}

                {/* Hành động */}
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <div className="flex justify-center gap-2 flex-wrap md:flex-nowrap">
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
                          onClick={() => remove(r.id)}
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={schema.columns.length + 1}
                  className="py-6 text-center text-gray-500"
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination gọn ngang hàng */}
<div className="flex items-center justify-between mt-4 flex-wrap gap-3">
  <div className="text-sm text-gray-600">
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
          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
      }`}
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      disabled={currentPage <= 1}
    >
      Trang trước
    </button>

    <span className="px-2 text-sm font-semibold text-gray-700">
      {currentPage} / {totalPages}
    </span>

    <button
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
        currentPage >= totalPages
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
      }`}
      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      disabled={currentPage >= totalPages}
    >
      Trang sau
    </button>
  </div>
</div>



      {/* Modal thêm/sửa */}
      <CrudModal
        open={open}
        title={editing ? `Sửa ${schema.title}` : `Thêm ${schema.title}`}
        fields={schema.fields}
        value={editing}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />

      {/* Modal xem chi tiết */}
      {viewing && (
        <CrudModal
          open={!!viewing}
          title={`Chi tiết ${schema.title}`}
          fields={schema.fields.map((f) => ({ ...f, disabled: true }))}
          value={viewing}
          onClose={() => setViewing(null)}
          onSubmit={() => {}}
          readOnly={true}
        />
      )}
    </div>
  );
}
