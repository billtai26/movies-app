// src/ui/pages/admin/Comments.tsx
import React from "react";
import CrudTable from "../../components/CrudTable";
import { schemas } from "../../../types/entities";
import { api } from "../../../lib/backendApi"; // Import api
import { toast } from "react-toastify";      // Import toast

export default function AdminComments() {
  return (
    <div className="w-full">
      <CrudTable 
        schema={schemas["comments"]}
        canCreate={false} // Không cho phép tạo mới bình luận từ admin
        // Định nghĩa nút bấm tùy chỉnh
        renderRowActions={(row, { reload }) => {
          // Kiểm tra trạng thái hiện tại (mặc định là 'shown' nếu không có)
          const isHidden = row.status === 'hidden';

          const handleToggle = async () => {
            try {
              const newStatus = isHidden ? 'shown' : 'hidden';
              // Gọi API update
              await api.update('comments', row._id || row.id, { status: newStatus });
              toast.success(`Đã ${isHidden ? 'hiện' : 'ẩn'} bình luận thành công!`);
              // Load lại bảng
              reload();
            } catch (error) {
              toast.error("Lỗi cập nhật trạng thái");
            }
          };

          return (
            <button 
              onClick={handleToggle}
              className={`font-semibold px-3 py-1 rounded text-sm transition-colors ${
                isHidden 
                  ? "bg-gray-200 text-gray-600 hover:bg-gray-300" // Style khi đang Ẩn
                  : "bg-red-100 text-red-600 hover:bg-red-200"    // Style khi đang Hiện (nút bấm để Ẩn)
              }`}
            >
              {isHidden ? "Hiện lại" : "Ẩn đi"}
            </button>
          );
        }}
      />
    </div>
  );
}