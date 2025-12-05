import React from "react";
import CrudTable from "../../components/CrudTable";
import { useAuth } from "../../../store/auth";

export default function Combos() {
  const { role } = useAuth();
  // Chỉ Admin mới được quyền thêm/sửa/xóa, Staff chỉ xem
  const canEdit = role === "admin"; 

  const schema = {
    name: "combos", // Tên này khớp với API endpoint (GET /combos)
    title: "Quản lý Combo & Bắp nước",
    columns: [
      { key: "imageUrl", label: "Ảnh" },
      { key: "name", label: "Tên Combo" },
      { key: "price", label: "Giá bán" },
      { key: "description", label: "Mô tả" }, // Kiểm tra lại key này với Backend
    ],
    fields: [
      { key: "name", label: "Tên Combo", type: "text", required: true },
      { key: "price", label: "Giá (VNĐ)", type: "number", required: true },
      { key: "description", label: "Mô tả chi tiết", type: "textarea" },
      { key: "imageUrl", label: "Link ảnh (URL)", type: "text", placeholder: "https://..." },
    ]
  };

  return <CrudTable schema={schema as any} canEdit={canEdit} />;
}