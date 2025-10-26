
import React, { useEffect } from "react";
import { seedAll } from "../../../lib/seed";
import { useCollection } from "../../../lib/mockCrud";

export default function Reports(){
  useEffect(()=>{ seedAll(); },[]);
  const { rows: tickets } = useCollection<any>("tickets");
  const total = tickets.length;
  const done = tickets.filter(t=>t.status==="done").length;
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="card"><div className="text-sm opacity-70">Tổng vé</div><div className="text-3xl font-bold">{total}</div></div>
      <div className="card"><div className="text-sm opacity-70">Đã vào</div><div className="text-3xl font-bold text-green-500">{done}</div></div>
      <div className="card"><div className="text-sm opacity-70">Chờ</div><div className="text-3xl font-bold text-yellow-500">{total-done}</div></div>
    </div>
  );
}
