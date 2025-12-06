import React from "react";
import CrudTable from "../../components/CrudTable";
import { schemas } from "../../../types/entities";

export default function AdminCombos() {
  return (
    <div className="w-full">
      {/* Sử dụng schema 'combos' đã định nghĩa trong entities.ts */}
      <CrudTable schema={schemas["combos"]} />
    </div>
  );
}