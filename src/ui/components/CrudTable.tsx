// src/ui/components/CrudTable.tsx
import React, { useEffect, useState } from "react";
import CrudModal from "./CrudModal";
import { EntitySchema } from "../../types/entities";
import { api } from "../../lib/backendApi"; // <--- 1. Import API thật

export default function CrudTable({
  schema,
  canEdit = true,
}: {
  schema: EntitySchema;
  canEdit?: boolean;
}) {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);
  
  // --- STATE PHÂN TRANG & TÌM KIẾM ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [keyword, setKeyword] = useState(""); // Tìm kiếm (q)
  const [filters, setFilters] = useState<Record<string, string>>({});

  // 1. HÀM GỌI API (Fetch Data)
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        limit: pageSize,
        q: keyword,
        ...filters,
      };

      const data = await api.list(schema.name, params);
      
      // --- SỬA ĐOẠN NÀY ---
      let listData = [];

      if (Array.isArray(data)) {
        // Trường hợp API trả về mảng trực tiếp
        listData = data;
      } else if (data[schema.name]) { 
        // Trường hợp API trả về { movies: [...] } -> Lấy data["movies"]
        // Đây là dòng giúp fix lỗi của bạn!
        listData = data[schema.name];
      } else if (data.results) {
        // Trường hợp API trả về { results: [...] }
        listData = data.results;
      } else if (data.data) {
        // Trường hợp API trả về { data: [...] }
        listData = data.data;
      }
      
      setRows(listData || []);
      // --------------------

    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // 2. GỌI LẠI API KHI THAM SỐ THAY ĐỔI
  useEffect(() => {
    // Tạo độ trễ 500ms để chờ người dùng nhập xong mới gọi API
    const timer = setTimeout(() => {
      fetchData();
    }, 500);

    // Xoá timer nếu người dùng thay đổi tham số trước khi hết 500ms
    return () => clearTimeout(timer);
  }, [page, pageSize, keyword, JSON.stringify(filters), schema.name]);

  // 3. HÀM XỬ LÝ THÊM / SỬA / XOÁ
  const onSubmit = async (data: any) => {
    try {
      if (editing) {
        // Gọi API Update
        await api.update(schema.name, editing.id || editing._id, data);
      } else {
        // Gọi API Create
        await api.create(schema.name, data);
      }
      setOpen(false);
      fetchData(); // Load lại bảng sau khi lưu
      alert("Thành công!");
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const onRemove = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xoá không?")) return;
    try {
      await api.remove(schema.name, id);
      fetchData(); // Load lại bảng sau khi xoá
    } catch (error) {
      console.error("Lỗi xoá:", error);
      alert("Không thể xoá mục này.");
    }
  };

  // --- CÁC HÀM UI ---
  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const onEdit = (r: any) => {
    setEditing(r);
    setOpen(true);
  };

  // Filter UI logic (Giữ nguyên hoặc tuỳ biến)
  const FILTER_KEYS = ["status", "role", "cinema"];
  const availableFilters = FILTER_KEYS.filter((key) =>
    schema.columns.some((c) => c.key === key)
  );

  return (
    <div className="card table-wrap w-full overflow-hidden">
      {/* Header & Filter giữ nguyên nhưng input search gọi setKeyword */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="text-lg font-semibold">{schema.title}</div>
          <div className="flex items-center gap-2">
             <input
                className="input"
                placeholder="Tìm kiếm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)} // Thay đổi keyword -> useEffect chạy -> gọi API
              />
              {canEdit && (
                  <button 
                    className="btn-primary whitespace-nowrap shrink-0" 
                    onClick={onCreate}
                  >
                    + Thêm
                  </button>
                )}
          </div>
        </div>
      </div>

      {/* Table Content */}
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
              rows.map((r: any) => (
                <tr key={r.id || r._id} className="border-t hover:bg-gray-50">
                  {schema.columns.map((c) => (
                    <td key={c.key} className="px-3 py-2 align-middle">
                      {/* Logic hiển thị giống cũ (Image, Date...) */}
                      {c.key === "poster" || c.key === "posterUrl" ? (
                         <img src={r[c.key]} alt="" className="h-10 w-8 object-cover rounded" />
                      ) : (
                         String(r[c.key] || "")
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    <div className="flex justify-center gap-2">
                       <button className="text-blue-600" onClick={() => onEdit(r)}>Sửa</button>
                       <button className="text-red-600" onClick={() => onRemove(r.id || r._id)}>Xoá</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={10} className="text-center py-4">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination đơn giản */}
      <div className="flex justify-end gap-2 mt-4">
        <button 
           className="btn-secondary" 
           disabled={page <= 1} 
           onClick={() => setPage(p => p - 1)}
        >
           Trang trước
        </button>
        <span className="py-2 px-3 bg-gray-100 rounded">Trang {page}</span>
        <button 
           className="btn-secondary" 
           // Nếu rows trả về ít hơn pageSize nghĩa là hết trang
           disabled={rows.length < pageSize} 
           onClick={() => setPage(p => p + 1)}
        >
           Trang sau
        </button>
      </div>

      <CrudModal
        open={open}
        title={editing ? `Sửa ${schema.title}` : `Thêm ${schema.title}`}
        fields={schema.fields}
        value={editing}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
