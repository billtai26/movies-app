// client/src/ui/pages/admin/Users.tsx
import React from "react";
import CrudTable from "../../components/CrudTable";

export default function AdminUsers() {
  const schema = {
    name: "users", // map với endpoint /api/users
    title: "Người dùng",
    columns: [
      { key: "name", label: "Họ tên" },
      { key: "email", label: "Email" },
      { key: "role", label: "Vai trò" },
      { key: "createdAt", label: "Ngày tạo" },
    ],
    fields: [
      { key: "name", label: "Họ và tên", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "password", label: "Mật khẩu", type: "text", placeholder: "Chỉ nhập khi thêm mới" },
      {
        key: "role",
        label: "Vai trò",
        type: "select",
        required: true,
        options: [
          { label: "Người dùng", value: "user" },
          { label: "Nhân viên", value: "staff" },
          { label: "Quản trị viên", value: "admin" },
        ],
      },
      { key: "phone", label: "Số điện thoại", type: "text" },
      { key: "avatar", label: "Ảnh đại diện (URL)", type: "image" },
      {
        key: "isActive",
        label: "Kích hoạt tài khoản",
        type: "boolean",
        placeholder: "Bật / Tắt",
      },
    ],
  };

  return (
    <div className="w-full">
      <CrudTable schema={schema as any} />
    </div>
  );
}
