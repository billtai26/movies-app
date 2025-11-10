
import React, { useEffect } from "react";
import CrudTable from "../../components/CrudTable";
import { schemas } from "../../../types/entities";


export default function AdminTheaters() {
  useEffect(() => {  }, []);
  return <CrudTable schema={schemas["theaters"]} />;
}
