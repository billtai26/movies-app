
import React, { useEffect } from "react";
import CrudTable from "../../components/CrudTable";
import { schemas } from "../../../types/entities";

export default function AdminMovies() {
  return <CrudTable schema={schemas["movies"]} />;
}
