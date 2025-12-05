import React from "react";
import CrudTable from "../../components/CrudTable";
import { schemas } from "../../../types/entities";

export default function StaffComments() {
  // Tạo schema riêng cho Staff dựa trên schema gốc
  // Mục đích: Khóa các trường nội dung (readonly), chỉ cho phép sửa Status
  const staffSchema = {
    ...schemas["comments"],
    title: "Kiểm duyệt bình luận", // Đổi tiêu đề cho phù hợp ngữ cảnh
    fields: schemas["comments"].fields.map((field) => {
      // Nếu là trường 'status' -> Giữ nguyên để Staff chọn (Hiển thị/Ẩn)
      if (field.key === "status") {
        return field;
      }
      // Các trường còn lại (author, content, movieId...) -> Bật chế độ chỉ đọc khi sửa
      return { ...field, readonlyOnEdit: true };
    }),
  };

  return (
    <div className="w-full space-y-4">
      <h1 className="text-2xl font-bold">Quản lý bình luận</h1>
      {/* Sử dụng CrudTable để tự động gọi API GET /comments, PUT /comments/:id */}
      <CrudTable schema={staffSchema} canEdit={true} />
    </div>
  );
}