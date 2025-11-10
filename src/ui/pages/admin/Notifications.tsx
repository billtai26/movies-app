
import React, { useEffect } from "react";
import CrudTable from "../../components/CrudTable";
import { schemas } from "../../../types/entities";

export default function AdminNotifications() {
  useEffect(() => { seedAll(); }, []);
  return <CrudTable schema={schemas["notifications"]} />;
}
