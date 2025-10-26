
// src/ui/components/CrudModal.tsx
import React from "react";
import { FieldSchema } from "../../types/entities";

export default function CrudModal({
  open, title, fields, value, onClose, onSubmit
}:{
  open:boolean; title:string; fields:FieldSchema[];
  value:any; onClose:()=>void; onSubmit:(data:any)=>void;
}){
  const [form, setForm] = React.useState<any>(value || {});
  React.useEffect(()=>{ setForm(value || {}) }, [value]);
  if (!open) return null;

  const change = (k:string, v:any) => setForm((f:any)=>({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <button className="btn-outline" onClick={onClose}>Đóng</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-auto pr-1">
          {fields.map(f => (
            <div key={f.key} className={f.type==="textarea" ? "md:col-span-2" : ""}>
              <label className="label">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea className="input h-28" value={form[f.key]||""} onChange={e=>change(f.key, e.target.value)} placeholder={f.placeholder||""}/>
              ) : f.type === "select" ? (
                <select className="input" value={form[f.key]||""} onChange={e=>change(f.key, e.target.value)}>
                  <option value="">-- Chọn --</option>
                  {(f.options||[]).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === "number" ? (
                <input type="number" className="input" value={form[f.key]||""} onChange={e=>change(f.key, Number(e.target.value))} placeholder={f.placeholder||""}/>
              ) : f.type === "datetime" ? (
                <input type="datetime-local" className="input" value={form[f.key]||""} onChange={e=>change(f.key, e.target.value)}/>
              ) : (
                <input className="input" value={form[f.key]||""} onChange={e=>change(f.key, e.target.value)} placeholder={f.placeholder||""}/>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <button className="btn-primary" onClick={()=>onSubmit(form)}>Lưu</button>
        </div>
      </div>
    </div>
  );
}
