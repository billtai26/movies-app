import React, { useEffect } from "react";
import CrudTable from "../../components/CrudTable";

import { useCollection } from "../../../lib/mockCrud";

export default function Genres() {
  useEffect(() => {  }, []);
  const { rows } = useCollection<any>("genres");

  const schema = {
    name: "genres",
    title: "Thể loại",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Tên thể loại" },
    ],
    fields: [
      { key: "name", label: "Tên thể loại", type: "text", required: true },
    ],
  };

  return <CrudTable schema={schema as any} />;
}
