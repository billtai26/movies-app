// src/ui/pages/admin/Users.tsx
import React from "react";
import CrudTable from "../../components/CrudTable";
import { schemas } from "../../../types/entities"; // Import schemas chung

export default function AdminUsers() {
  // Dùng trực tiếp schemas.users đã sửa ở bước trước
  return (
    <div className="w-full">
      <CrudTable schema={schemas.users} />
    </div>
  );
}