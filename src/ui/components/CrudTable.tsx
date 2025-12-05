// src/ui/components/CrudTable.tsx
import React, { useEffect, useState } from "react";
import CrudModal from "./CrudModal";
import { EntitySchema } from "../../types/entities";
import { api } from "../../lib/backendApi"; 
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";

export default function CrudTable({
  schema,
  canEdit = true,
}: {
  schema: EntitySchema;
  canEdit?: boolean;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState(""); 
  const [filters, setFilters] = useState<Record<string, string>>({});

  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize, q: keyword, ...filters };
      const data = await api.list(schema.name, params);
      
      let listData: any[] = [];
      if (Array.isArray(data)) listData = data;
      else if (data && typeof data === 'object') {
        if (Array.isArray(data[schema.name])) listData = data[schema.name];
        else if (Array.isArray(data.results)) listData = data.results;
        else if (Array.isArray(data.data)) listData = data.data;
        else {
           const keys = Object.keys(data);
           for (const key of keys) {
              if (key !== 'pagination' && Array.isArray(data[key])) {
                 listData = data[key];
                 break;
              }
           }
        }
      }
      setRows(listData || []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 500);
    return () => clearTimeout(timer);
  }, [page, pageSize, keyword, JSON.stringify(filters), schema.name]);

  const onSubmit = async (data: any) => {
    try {
      const payload = (schema as any).toPayload ? (schema as any).toPayload(data) : data;
      if (editing) await api.update(schema.name, editing.id || editing._id, payload);
      else await api.create(schema.name, payload);
      setOpen(false);
      fetchData();
      toast.success("Thành công!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  const handleDeleteClick = (id: string) => setDeleteId(id);

  const onConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.remove(schema.name, deleteId);
      toast.success("Đã xóa thành công!");
      fetchData(); 
    } catch (error: any) {
      toast.error("Lỗi: Không thể xóa bản ghi này.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (r: any) => {
    const formData = (schema as any).toForm ? (schema as any).toForm(r) : r;
    setEditing(formData);
    setOpen(true);
  };

  // --- THÊM LOGIC TÍNH TOÁN FIELDS TRƯỚC KHI TRUYỀN VÀO MODAL ---
  const modalFields = schema.fields.map((field) => {
    // Nếu đang Edit (editing != null) và field có cờ readonlyOnEdit -> Khóa lại
    if (editing && field.readonlyOnEdit) {
      return { ...field, disabled: true };
    }
    return field;
  });
  // -------------------------------------------------------------

  return (
    <div className="card table-wrap w-full overflow-hidden">
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="text-lg font-semibold">{schema.title}</div>
          <div className="flex items-center gap-2">
             <input className="input" placeholder="Tìm kiếm..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              {canEdit && <button className="btn-primary whitespace-nowrap shrink-0" onClick={onCreate}>+ Thêm</button>}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border w-full relative">
        {loading && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">Đang tải...</div>}
        
        <table className="min-w-[700px] w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {schema.columns.map((c) => (
                <th key={c.key} className="px-3 py-2 text-left font-semibold">{c.label}</th>
              ))}
              <th className="px-3 py-2 text-center font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((originalRow: any) => {
                // --- ĐÂY LÀ ĐOẠN QUAN TRỌNG ĐỂ SỬA LỖI HIỂN THỊ ---
                const displayRow = (schema as any).transformRow 
                    ? (schema as any).transformRow(originalRow) 
                    : originalRow;
                // --------------------------------------------------

                return (
                  <tr key={originalRow.id || originalRow._id} className="border-t hover:bg-gray-50">
                    {schema.columns.map((c) => (
                      <td key={c.key} className="px-3 py-2 align-middle">
                        {c.key === "poster" || c.key === "posterUrl" ? (
                           <img src={displayRow[c.key]} alt="" className="h-10 w-8 object-cover rounded" />
                        ) : (
                           String(displayRow[c.key] || "") // Bây giờ nó sẽ hiển thị Tên thay vì ID hoặc rỗng
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-2">
                         <button className="text-blue-600" onClick={() => onEdit(originalRow)}>Sửa</button>
                         <button className="text-red-600 hover:underline" onClick={() => handleDeleteClick(originalRow.id || originalRow._id)}> Xóa </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={10} className="text-center py-4">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trang trước</button>
        <span className="py-2 px-3 bg-gray-100 rounded">Trang {page}</span>
        <button className="btn-secondary" disabled={rows.length < pageSize} onClick={() => setPage(p => p + 1)}>Trang sau</button>
      </div>

      <CrudModal 
        open={open} 
        title={editing ? `Sửa ${schema.title}` : `Thêm ${schema.title}`} 
        fields={modalFields} 
        value={editing} 
        onClose={() => setOpen(false)} 
        onSubmit={onSubmit} 
      />
      <ConfirmModal open={!!deleteId} title="Xác nhận xóa" message="Hành động này không thể hoàn tác." onClose={() => setDeleteId(null)} onConfirm={onConfirmDelete} isLoading={isDeleting} />
    </div>
  );
}
