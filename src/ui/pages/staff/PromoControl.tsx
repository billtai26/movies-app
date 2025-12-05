import React from "react";
import CrudTable from "../../components/CrudTable";
import { schemas } from "../../../types/entities";
import { useAuth } from "../../../store/auth";

export default function PromoControl() {
  const { role } = useAuth();
  
  // Phân quyền: Staff chỉ được xem danh sách khuyến mãi hiện có
  // Admin mới được thêm/sửa/xóa (để tránh nhân viên tự ý tạo khuyến mãi)
  const canEdit = role === "admin"; 

  return (
    <div className="w-full space-y-4">
      <h1 className="text-2xl font-bold">Danh sách chương trình khuyến mãi</h1>
      {/* CrudTable sẽ đọc schema 'promotions':
         - Gọi API: api.list('promotions') -> GET /promos
         - Hiển thị các cột: Tiêu đề, Mã, Giảm giá (%), Ảnh...
      */}
      <CrudTable schema={schemas["promotions"]} canEdit={canEdit} />
    </div>
  );
}