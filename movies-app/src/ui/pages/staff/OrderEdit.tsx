
import React, { useEffect, useState } from "react";
import { useCollection } from "../../../lib/mockCrud";
import { seedAll } from "../../../lib/seed";

export default function OrderEdit(){
  const { rows: orders, update } = useCollection<any>("orders");
  useEffect(()=>{ seedAll(); },[]);
  const [sel, setSel] = useState<any|null>(null);
  const [status, setStatus] = useState("pending");
  const save = () => { if(sel){ update(sel.id, { status }); setSel(null); } };
  return (
    <div className="card">
      <div className="mb-3 text-lg font-semibold">Sửa đơn hàng</div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl border p-3 dark:border-gray-800">
          {orders.map(o => (
            <div key={o.id} className={`p-2 rounded-lg cursor-pointer ${sel?.id===o.id?'bg-black/5 dark:bg-white/10':''}`} onClick={()=>{ setSel(o); setStatus(o.status); }}>
              <div className="font-medium">Đơn #{o.id}</div>
              <div className="text-sm text-gray-500">Tổng: {o.total.toLocaleString()}đ — Trạng thái: {o.status}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border p-3 dark:border-gray-800">
          <div className="label">Trạng thái</div>
          <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="refunded">refunded</option>
          </select>
          <div className="mt-3 text-right"><button className="btn-primary" onClick={save}>Lưu</button></div>
        </div>
      </div>
    </div>
  )
}
