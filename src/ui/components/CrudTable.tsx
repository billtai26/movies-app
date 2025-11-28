// src/ui/components/CrudTable.tsx
import React, { useEffect, useState } from "react";
import CrudModal from "./CrudModal";
import { EntitySchema } from "../../types/entities";
import { api } from "../../lib/backendApi"; // <--- 1. Import API thật
import { toast } from "react-toastify";
// 1. Import component mới
import ConfirmModal from "./ConfirmModal";

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

  // 2. Thêm state quản lý việc xóa
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

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
      
      // --- BẮT ĐẦU ĐOẠN SỬA ---
      // Logic tìm kiếm mảng dữ liệu thông minh hơn (Smart Data Finding)
      let listData: any[] = [];

      if (Array.isArray(data)) {
        // 1. Nếu trả về mảng trực tiếp -> Lấy luôn
        listData = data;
      } else if (data && typeof data === 'object') {
        // 2. Nếu trả về object, ta sẽ đi tìm mảng bên trong
        
        // Ưu tiên 1: Tìm theo đúng tên schema (ví dụ: data['movies'])
        if (Array.isArray(data[schema.name])) {
           listData = data[schema.name];
        }
        // Ưu tiên 2: Tìm các key phổ biến (results, data, items)
        else if (Array.isArray(data.results)) {
           listData = data.results;
        } else if (Array.isArray(data.data)) {
           listData = data.data;
        }
        // Ưu tiên 3 (Quan trọng nhất): Quét tất cả các key để tìm mảng đầu tiên
        // Cách này giúp fix lỗi "theaters" vs "cinemas" của bạn
        else {
           const keys = Object.keys(data);
           for (const key of keys) {
              // Bỏ qua key 'pagination' hoặc các key không phải mảng
              if (key !== 'pagination' && Array.isArray(data[key])) {
                 listData = data[key];
                 break; // Tìm thấy mảng đầu tiên là chốt luôn
              }
           }
        }
      }
      
      setRows(listData || []);
      // --- KẾT THÚC ĐOẠN SỬA ---

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
      console.log("1. Dữ liệu gốc từ Form:", data); // Check log 1

      // 👉 KIỂM TRA VÀ GỌI HÀM toPayload
      // Dòng này cực kỳ quan trọng: Biến đổi 'theater' thành 'cinemaId'
      const payload = (schema as any).toPayload ? (schema as any).toPayload(data) : data;

      console.log("2. Payload gửi đi (Sau khi toPayload):", payload); // Check log 2
      // Nếu log này vẫn hiện 'theater' mà không có 'cinemaId' -> code toPayload bị lỗi hoặc chưa chạy

      if (editing) {
        await api.update(schema.name, editing.id || editing._id, payload);
      } else {
        await api.create(schema.name, payload);
      }

      setOpen(false);
      fetchData();
      toast.success("Thành công!");
    } catch (error: any) {
      console.error("Lỗi lưu dữ liệu:", error);
      const msg = error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      toast.error(msg);
    }
  };

  // 3. Sửa hàm handleDelete (Hàm này được gắn vào nút thùng rác ở bảng)
  const handleDeleteClick = (id: string) => {
    // Thay vì window.confirm, ta chỉ set state để mở Modal
    setDeleteId(id);
  };

  // 4. Hàm thực sự gọi API (sẽ truyền vào ConfirmModal)
  const onConfirmDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true); // Bật loading
    try {
      await api.remove(schema.name, deleteId);
      toast.success("Đã xóa thành công!");
      fetchData(); // Load lại bảng
    } catch (error: any) {
      toast.error("Lỗi: Không thể xóa bản ghi này.");
    } finally {
      setIsDeleting(false); // Tắt loading
      setDeleteId(null);    // Đóng modal
    }
  };

  // --- CÁC HÀM UI ---
  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const onEdit = (r: any) => {
    // 👉 SỬA ĐOẠN NÀY:
    // Kiểm tra xem schema có hàm toForm không?
    // - Nếu có: Chạy dữ liệu thô (r) qua hàm toForm để biến đổi (map cinemaId -> theater, Config -> chuỗi...)
    // - Nếu không: Dùng nguyên dữ liệu thô
    const formData = (schema as any).toForm ? (schema as any).toForm(r) : r;
    
    // console.log("Dữ liệu sau khi toForm:", formData); // Debug xem có dữ liệu chưa

    setEditing(formData);
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
                       <button  className="text-red-600 hover:underline"  onClick= {() => handleDeleteClick(r.id || r._id)}> Xóa </button>
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

      {/* Modal Xác nhận Xóa (Đặt ở đây là chuẩn nhất) */}
      <ConfirmModal
        open={!!deleteId} // Chỉ mở khi deleteId có giá trị (khác null)
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa dòng dữ liệu này không? Hành động này không thể hoàn tác."
        onClose={() => setDeleteId(null)}
        onConfirm={onConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
