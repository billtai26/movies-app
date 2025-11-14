import React, { useEffect } from "react";
import CrudTable from "../../components/CrudTable";

import { useAuth } from "../../../store/auth";

const schema = {
  name: "combos",
  title: "Combo bắp nước",
  columns: [
    { key: "imageUrl", label: "Ảnh" },
    { key: "name", label: "Tên" },
    { key: "price", label: "Giá" },
    { key: "desc", label: "Mô tả" },
  ],
  fields: [
    { key: "imageUrl", label: "Ảnh (URL)", type: "text", placeholder: "https://..." },
    { key: "name", label: "Tên", type: "text" },
    { key: "price", label: "Giá", type: "number" },
    { key: "desc", label: "Mô tả", type: "textarea" },
  ]
} as any;

export default function Combos(){
  useEffect(()=>{ seedAll(); },[]);
  const { role } = useAuth();
  const canEdit = role === "admin"; // Admin full CRUD, Staff read-only
  return <CrudTable schema={schema} canEdit={canEdit} />;
}
