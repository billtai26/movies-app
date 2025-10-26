
import React, { useEffect } from "react";
import { useCollection, update } from "../../../lib/mockCrud";
import { seedAll } from "../../../lib/seed";

export default function CheckIn(){
  const { rows: tickets, update } = useCollection<any>("tickets");
  useEffect(()=>{ seedAll(); },[]);
  const markDone = (id:string) => update(id, { status: "done" });
  return (
    <div className="card">
      <div className="mb-3 text-lg font-semibold">Quét vé / Check-in</div>
      <div className="space-y-2">
        {tickets.map(t => (
          <div key={t.id} className="flex items-center justify-between rounded-xl border p-3 dark:border-gray-800">
            <div>
              <div className="font-semibold">{t.code}</div>
              <div className="text-sm text-gray-500">{t.movie} — Ghế: {t.seats}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="chip">{t.status}</span>
              {t.status!=="done" && <button className="btn-primary" onClick={()=>markDone(t.id)}>Đã vào</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
