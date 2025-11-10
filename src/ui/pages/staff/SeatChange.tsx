
import React, { useEffect, useState } from "react";
import { useCollection } from "../../../lib/mockCrud";
import { seedAll } from "../../../lib/seed";

export default function SeatChange(){
  const { rows: tickets, update } = useCollection<any>("tickets");
  useEffect(()=>{ seedAll(); },[]);
  const [selected, setSelected] = useState<any|null>(null);
  const [seats, setSeats] = useState("");
  const save = () => { if(selected){ update(selected.id, { seats }); setSelected(null); } };

  return (
    <div className="card">
      <div className="mb-3 text-lg font-semibold">Đổi ghế</div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl border p-3">
          {tickets.map(t => (
            <div key={t.id} className={`p-2 rounded-lg cursor-pointer ${selected?.id===t.id?'bg-black/5':''}`} onClick={()=>{ setSelected(t); setSeats(t.seats); }}>
              <div className="font-medium">{t.movie}</div>
              <div className="text-sm text-gray-500">{t.code} — Ghế: {t.seats}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border p-3">
          <div className="label">Ghế mới (vd: B5,B6)</div>
          <input className="input" value={seats} onChange={e=>setSeats(e.target.value)} />
          <div className="mt-3 text-right"><button className="btn-primary" onClick={save}>Lưu</button></div>
        </div>
      </div>
    </div>
  )
}
