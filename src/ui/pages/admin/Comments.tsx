
import React, { useEffect } from "react";
import CrudTable from "../../components/CrudTable";
import { schemas } from "../../../types/entities";
import { seedAll } from "../../../lib/seed";

export default function AdminComments() {
  useEffect(() => { seedAll(); }, []);
  return <CrudTable schema={schemas["comments"]} />;
}
