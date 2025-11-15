import React from "react";
import CrudTable from "../../components/CrudTable";
import { schemas } from "../../../types/entities";

export default function AdminNotifications() {
  return (
    <div className="w-full">
      <CrudTable schema={schemas["notifications"]} />
    </div>
  );
}
