
import React, { useMemo, useState } from 'react'
type SeatState = 'empty'|'held'|'booked'|'selected'
type Seat = { id:string, row:string, col:number, type:'normal'|'vip'|'couple', state:SeatState }
function genSeats(rows:number, cols:number, vipRows:string[]=[], coupleRows:string[]=[]): Seat[] {
  const rs:Seat[] = []
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, rows).split('')
  for (let r=0; r<rows; r++){
    for (let c=1; c<=cols; c++){
      const row = letters[r]
      const type = coupleRows.includes(row) ? 'couple' : vipRows.includes(row) ? 'vip' : 'normal'
      const state:SeatState = Math.random() < 0.08 ? 'booked' : 'empty'
      rs.push({ id:`${row}${c}`, row, col:c, type, state })
    }
  }
  return rs
}
export default function SeatMap({ rows=8, cols=12, vipRows=['A','B'], coupleRows=['H'], onChange }:
  { rows?:number, cols?:number, vipRows?:string[], coupleRows?:string[], onChange?:(ids:string[])=>void }){
  const [seats, setSeats] = useState<Seat[]>(() => genSeats(rows, cols, vipRows, coupleRows))
  const selected = useMemo(() => seats.filter(s => s.state==='selected').map(s => s.id), [seats])
  const toggle = (id:string) => { setSeats(prev => prev.map(s => s.id===id ? ({...s, state: s.state==='empty' ? 'selected' : s.state==='selected' ? 'empty' : s.state}) : s)) }
  React.useEffect(() => { onChange && onChange(selected) }, [selected])
  const legend = [['bg-gray-200','Trống'],['bg-emerald-500 text-white','Đang chọn'],['bg-gray-800 text-white','Đã đặt'],['bg-amber-500 text-white','VIP'],['bg-pink-500 text-white','Ghế đôi']]
  return (
    <div className="space-y-4">
      <div className="mx-auto w-full max-w-xl rounded-xl bg-gray-900 p-2 text-center text-white">Màn hình</div>
      <div className="mx-auto w-full max-w-4xl">
        {Array.from({ length: rows }).map((_, r) => {
          const rowLabel = String.fromCharCode(65 + r)
          // seats for this row
          const rowSeats = seats.filter(s => s.row === rowLabel).sort((a, b) => a.col - b.col)
          return (
            <div key={r} className="mb-3 flex items-start gap-4">
              <div className="w-6 text-right pt-1 text-sm">{rowLabel}</div>
              <div
                className="grid gap-2 w-full"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {rowSeats.map((seat) => {
                  const base = "aspect-square rounded-md text-xs flex items-center justify-center cursor-pointer "
                  let cls = "bg-gray-200"
                  if (seat.state === 'booked') cls = "bg-gray-800 text-white cursor-not-allowed"
                  if (seat.state === 'selected') cls = "bg-emerald-500 text-white"
                  if (seat.type === 'vip' && seat.state === 'empty') cls = "bg-amber-500 text-white"
                  if (seat.type === 'couple' && seat.state === 'empty') cls = "bg-pink-500 text-white"
                  return (
                    <div
                      key={seat.id}
                      className={base + cls}
                      onClick={() => seat.state !== 'booked' && toggle(seat.id)}
                      title={seat.id}
                    >
                      <span className="select-none">{seat.col}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {legend.map(([cls, label]) => <div key={label as string} className="flex items-center gap-2">
          <div className={"h-4 w-4 rounded " + cls}></div><span className="text-sm text-gray-600">{label as string}</span>
        </div>)}
      </div>
    </div>
  )
}
