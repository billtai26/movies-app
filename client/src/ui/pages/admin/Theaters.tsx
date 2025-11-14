// client/src/ui/pages/admin/Theaters.tsx
import React from "react";
import CrudTable from "../../components/CrudTable";

export default function AdminTheaters() {
  const schema = {
    name: "theaters", // 👈 map đúng endpoint /api/theaters
    title: "Rạp / Cụm Rạp",
    columns: [
      { key: "name", label: "Tên rạp" },
      { key: "city", label: "Thành phố" },
      { key: "address", label: "Địa chỉ" },
      { key: "phone", label: "SĐT" },
    ],
    fields: [
      { key: "name", label: "Tên rạp", type: "text", required: true },
      { key: "city", label: "Thành phố", type: "text", placeholder: "VD: TP.HCM" },
      { key: "address", label: "Địa chỉ", type: "textarea", required: true },
      { key: "phone", label: "Số điện thoại", type: "text" },
      { key: "image", label: "Ảnh đại diện (URL)", type: "image" },
      {
        key: "isActive",
        label: "Trạng thái hoạt động",
        type: "boolean",
        placeholder: "Bật / Tắt",
      },
    ],
  };

  return <CrudTable schema={schema as any} />;
}
