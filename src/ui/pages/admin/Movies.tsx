// file: src/ui/pages/admin/Movies.tsx
import React from "react";
import CrudTable from "../../components/CrudTable";
import { schemas } from "../../../types/entities";

export default function AdminMovies() {
  // CrudTable sẽ đọc schemas['movies'] -> gọi api.listMovies (hoặc api.list('movies'))
  // Khi bấm Save -> gọi api.create('movies', data) -> Logic mới trong backendApi sẽ chạy.
  return (
    <div className="w-full">
      <CrudTable schema={schemas["movies"]} />
    </div>
  );
}
