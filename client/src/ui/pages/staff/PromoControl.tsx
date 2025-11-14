
import React, { useEffect } from "react";
import CrudTable from "../../components/CrudTable";
import { schemas } from "../../../types/entities";

export default function PromoControl(){
  useEffect(()=>{ seedAll(); },[]);
  return <CrudTable schema={schemas["promotions"]} />;
}
