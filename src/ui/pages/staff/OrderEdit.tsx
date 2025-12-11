import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api"; // ✅ Dùng API thật
import CustomSelect from "../../../ui/components/CustomSelect";
import toast from "react-hot-toast";
import LoadingOverlay from "../../components/LoadingOverlay"; // Thêm loading
import ConfirmModal from "../../components/ConfirmModal";

export default function OrderEdit() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [editing, setEditing] = useState<any | null>(null);
  const [status, setStatus] = useState("pending");
  const [keyword, setKeyword] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // 1. Tải danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Gọi API lấy danh sách
      const res = await api.list("orders");
      const list = Array.isArray(res) ? res : (res.data || []);
      // Sắp xếp đơn mới nhất lên đầu
      setOrders(list.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ));
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEdit = (order: any) => {
  setEditing(order);
  // Backend dùng paymentStatus, Frontend state dùng biến 'status' để binding vào input
  setStatus(order.paymentStatus || "pending");
  };

  // Thêm state để lưu đơn hàng đang chờ xóa
  const [deletingOrder, setDeletingOrder] = useState<any | null>(null);

  // Hàm mở Modal (thay thế cho việc gọi confirm)
  const openDeleteModal = (order: any) => {
    setDeletingOrder(order);
  };

  // Hàm thực hiện xóa (sẽ được gọi khi user bấm nút "Xóa" trong Modal)
  const confirmDelete = async () => {
    if (!deletingOrder) return;
    
    try {
      setLoading(true);
      await api.remove("orders", deletingOrder.id || deletingOrder._id);
      
      toast.success("Đã xóa đơn hàng");
      setOrders(prev => prev.filter(o => (o._id || o.id) !== (deletingOrder._id || deletingOrder.id)));
      
      if (editing?.id === deletingOrder.id) setEditing(null);
    } catch (error) {
      toast.error("Lỗi khi xóa đơn hàng");
    } finally {
      setLoading(false);
      setDeletingOrder(null); // Đóng modal
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    
    // Lấy ID chính xác để so sánh
    const editingId = editing.id || editing._id; 

    try {
      setLoading(true);
      await api.update("orders", editingId, { 
        paymentStatus: status 
      });
      
      setOrders(prev => prev.map(o => {
        const currentId = o.id || o._id;
        // Chỉ cập nhật nếu ID trùng khớp
        if (currentId === editingId) {
            return { ...o, paymentStatus: status };
        }
        return o; // Giữ nguyên các đơn hàng khác
      }));
      
      toast.success("Cập nhật trạng thái thành công!");
      setEditing(null);
    } catch (error) {
      toast.error("Lỗi khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  // Search filter (Client-side cho nhanh với list nhỏ, hoặc gọi API nếu cần)
  const filtered = orders.filter((o) => {
    const id = String(o.id || o._id || "");
    const st = String(o.status || "");
    const kw = keyword.toLowerCase();
    return id.toLowerCase().includes(kw) || st.toLowerCase().includes(kw);
  });

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
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow space-y-5 relative min-h-[400px]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Quản lý đơn hàng
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <select
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20].map((n) => (
              <option key={n} value={n}>{n} / trang</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            className="input sm:w-56"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng đơn hàng */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="text-left px-3 py-2">Mã đơn</th>
              <th className="text-left px-3 py-2">Ngày tạo</th>
              <th className="text-left px-3 py-2">Tổng tiền (₫)</th>
              <th className="text-left px-3 py-2">Trạng thái</th>
              <th className="text-center px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((order) => (
              <tr
                key={order.id || order._id}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                  #{order.id || order._id}
                </td>
                <td className="px-3 py-2 text-gray-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}
                </td>
                <td className="px-3 py-2 font-medium text-blue-600">
                  {(order.totalAmount || order.amount || 0).toLocaleString("vi-VN")}
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    (order.paymentStatus === 'completed' || order.paymentStatus === 'paid') ? 'bg-green-100 text-green-700' :
                    (order.paymentStatus === 'refunded') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {/* Hiển thị paymentStatus hoặc bookingStatus */}
                    {order.paymentStatus || order.bookingStatus || order.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(order)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => openDeleteModal(order)} // Gọi hàm mở Modal
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
                <td colSpan={5} className="text-center py-6 text-gray-500 italic">
                  Không có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Hiển thị {total === 0 ? 0 : `${start + 1}–${Math.min(end, total)}`} / Tổng {total}
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Trước
          </button>
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Sau
          </button>
        </div>
      </div>

      {/* Form chỉnh sửa */}
      {editing && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 animate-fadeIn">
          <div className="text-base font-semibold mb-2">
            Đang chỉnh sửa đơn <span className="text-blue-500">#{editing.id || editing._id}</span>
          </div>
          
          <div className="label mb-1">Trạng thái mới</div>
          <div className="max-w-xs">
            <CustomSelect
              value={status}
              onChange={setStatus}
              options={[
                // SỬA CÁC DÒNG NÀY:
                { value: "pending", label: "Chờ thanh toán" },
                { value: "completed", label: "Đã thanh toán" }, // Đổi 'paid' -> 'completed'
                { value: "failed", label: "Thất bại/Hủy" },
                { value: "refunded", label: "Hoàn tiền" }      // Đổi thành 'failed'
                
                // Lưu ý: Backend hiện tại chưa hỗ trợ 'refunded' hay 'cancelled' cho trường paymentStatus
                // Nếu muốn dùng 'refunded', bạn phải sửa cả Backend (file bookingModel.js và bookingValidation.js)
              ]}
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setEditing(null)}
className="px-3 py-1 rounded-md border hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}
      {/* Modal xác nhận xóa */}
      <ConfirmModal
        open={!!deletingOrder}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa đơn hàng #${deletingOrder?.id || deletingOrder?._id}? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        // 1. Sửa onCancel thành onClose
        onClose={() => setDeletingOrder(null)} 
        // 2. XÓA 2 dòng này đi (vì component không hỗ trợ)
        // confirmText="Xóa đơn hàng"
        // confirmType="danger"
        
        // 3. Thêm isLoading (nếu muốn hiển thị spinner quay quay)
        isLoading={loading}
      />
      <LoadingOverlay isLoading={loading} message="Đang xử lý..." />
    </div>
  );
}
