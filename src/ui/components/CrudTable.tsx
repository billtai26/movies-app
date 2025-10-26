
// src/ui/components/CrudTable.tsx
import React from "react";
import CrudModal from "./CrudModal";
import { EntitySchema } from "../../types/entities";
import { useCollection } from "../../lib/mockCrud";

export default function CrudTable({ schema, canEdit=true }: { schema: EntitySchema, canEdit?: boolean }) {
  const { rows, create, update, remove } = useCollection<any>(schema.name as any);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<any|null>(null);
  const [keyword, setKeyword] = React.useState("");

  const filtered = rows.filter((r:any)=> JSON.stringify(r).toLowerCase().includes(keyword.toLowerCase()));

  const onCreate = () => { setEditing(null); setOpen(true); };
  const onEdit = (r:any) => { setEditing(r); setOpen(true); };
  const onSubmit = (data:any) => {
    if (editing) update(editing.id, data);
    else create(data);
    setOpen(false);
  };

  return (
    <div className="card table-wrap">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-semibold">{schema.title}</div>
        <div className="flex items-center gap-2">
          <input className="input" placeholder="Tìm kiếm..." value={keyword} onChange={e=>setKeyword(e.target.value)} />
          {canEdit && (<button className="btn-primary" onClick={onCreate}>+ Thêm</button>)}
        </div>
      </div>

      <div className="overflow-auto rounded-xl border dark:border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {schema.columns.map(c => (
                <th key={c.key} className="px-3 py-2 text-left font-semibold">{c.label}</th>
              ))}
              <th className="px-3 py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r:any) => (
              <tr key={r.id} className="border-t dark:border-gray-800">
                {schema.columns.map(c => (
                  <td key={c.key} className="px-3 py-2">
                    {c.key === "poster" ? (
                      <img src={r[c.key]} alt="" className="h-10 w-8 object-cover rounded"/>
                    ) : c.key === "imageUrl" ? (
                      <img src={r[c.key] || "https://placehold.co/80x80"} alt="" className="h-20 w-20 object-cover rounded-lg border"/>
                    ) : (
                      String(r[c.key] ?? "")
                    )}
                  </td>
                ))}
                <td className="px-3 py-2 text-right">
                  {canEdit ? (<><button className="btn-outline mr-2" onClick={()=>onEdit(r)}>Sửa</button><button className="btn-outline" onClick={()=>remove(r.id)}>Xoá</button></>) : null}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={schema.columns.length+1} className="px-3 py-6 text-center text-gray-500">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <CrudModal
        open={open}
        title={editing ? `Sửa ${schema.title}` : `Thêm ${schema.title}`}
        fields={schema.fields}
        value={editing}
        onClose={()=>setOpen(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
