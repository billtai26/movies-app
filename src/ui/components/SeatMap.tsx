
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
      const state:SeatState = Math.random() < 0.1 ? 'booked' : 'empty'
      rs.push({ id:`${row}${c}`, row, col:c, type, state })
    }
  }
  return rs
}
export default function SeatMap({ rows=8, cols=12, vipRows=['A','B'], coupleRows=['H'], aisleCols=[], aisleRows=[], maxSelected=Infinity, onLimitExceeded, onChange }:
  { rows?:number, cols?:number, vipRows?:string[], coupleRows?:string[], aisleCols?:number[], aisleRows?:string[], maxSelected?:number, onLimitExceeded?:()=>void, onChange?:(ids:string[])=>void }){
  const [seats, setSeats] = useState<Seat[]>(() => genSeats(rows, cols, vipRows, coupleRows))
  // Re-generate seats when layout config changes (e.g., VIP rows updated)
  const prevCfg = React.useRef<string>('')
  React.useEffect(() => {
    const cfg = `${rows}:${cols}|${vipRows.join(',')}|${coupleRows.join(',')}`
    if (prevCfg.current !== cfg){
      prevCfg.current = cfg
      setSeats(genSeats(rows, cols, vipRows, coupleRows))
    }
  }, [rows, cols, vipRows, coupleRows])
  const selected = useMemo(() => seats.filter(s => s.state==='selected').map(s => s.id), [seats])
  const toggle = (id:string) => {
    setSeats(prev => {
      const seat = prev.find(s=>s.id===id)
      if (!seat) return prev
      if (seat.state==='empty'){
        const currentlySelected = prev.filter(s=>s.state==='selected').length
        if (currentlySelected + 1 > maxSelected){ onLimitExceeded && onLimitExceeded(); return prev }
      }
      return prev.map(s => s.id===id ? ({...s, state: s.state==='empty' ? 'selected' : s.state==='selected' ? 'empty' : s.state}) : s)
    })
  }
  const toggleMany = (ids:string[]) => {
    setSeats(prev => {
      const addCount = prev.filter(s=> ids.includes(s.id) && s.state==='empty').length
      if (addCount>0){
        const currentlySelected = prev.filter(s=>s.state==='selected').length
        if (currentlySelected + addCount > maxSelected){ onLimitExceeded && onLimitExceeded(); return prev }
      }
      return prev.map(s => ids.includes(s.id) ? ({...s, state: s.state==='empty' ? 'selected' : s.state==='selected' ? 'empty' : s.state}) : s)
    })
  }
  React.useEffect(() => { onChange && onChange(selected) }, [selected])
  const legend:[string,string][] = [
    ['bg-gray-300','Ghế đã bán'],
    ['bg-orange-500','Ghế đang chọn'],
    ['border border-yellow-500 bg-white','Ghế VIP'],
    ['bg-pink-500','Ghế đôi'],
    ['bg-white border border-gray-300','Trống'],
  ]
  return (
    <div className="space-y-4">
      <div className="w-full rounded-xl bg-gray-900 p-2 text-center text-white">Màn hình</div>
      <div className="mx-auto max-w-5xl overflow-x-auto">
        {Array.from({length: rows}).map((_, r) => {
          const prevLetter = String.fromCharCode(65 + r - 1)
          const addSpacer = r>0 && aisleRows.includes(prevLetter)
          return (
          <React.Fragment key={r}>
          {addSpacer && <div className="h-4" />}
          <div key={`row-${r}`} className="mb-2 relative flex items-center justify-center gap-1">
            <span className="absolute left-0 w-8 text-right">{String.fromCharCode(65+r)}</span>
            {Array.from({length: cols}).map((_, c) => {
              const colNum = c + 1
              const isAisle = aisleCols.includes(colNum)
              const seat = seats.find(s => s.row===String.fromCharCode(65+r) && s.col===colNum)
              if (!seat) return <div key={c} className="w-8" />
              const baseSingle = "h-8 w-8 rounded-md text-xs flex items-center justify-center cursor-pointer"
              const basePair = "h-8 w-16 rounded-md text-[10px] flex items-center justify-center cursor-pointer"
              const clsBooked = "bg-gray-800 text-white cursor-not-allowed"
              const clsSelected = "bg-orange-500 text-white"
              const clsEmpty = "bg-white border border-gray-300"
              const clsVipEmpty = "bg-white border border-yellow-500"
              const clsCoupleEmpty = "bg-pink-500 text-white"

              // Couple seats logic
              if (seat.type==='couple'){
                // If even column: normally skip (paired by odd). But if this or previous is aisle, render single.
                if (colNum % 2 === 0){
                  // Even-index of couple seat is always handled by the previous odd seat (pair rendered there)
                  return <div key={c} className="w-0" />
                }
                // odd column start of pair
                const nextCol = colNum + 1
                const nextIsAisle = aisleCols.includes(nextCol)
                if (nextIsAisle){
                  // Render single and spacer because pair would cross aisle
                  let cls = clsCoupleEmpty
                  if (seat.state==='booked') cls = clsBooked
                  else if (seat.state==='selected') cls = clsSelected
                  return <div key={c} className={baseSingle + " " + cls} onClick={()=> seat.state!=='booked' && toggle(seat.id)}>{seat.col}</div>
                }
                const seat2 = seats.find(s => s.row===seat.row && s.col===nextCol)
                const bookedPair = (seat.state==='booked') || (seat2?.state==='booked')
                const selectedPair = (seat.state==='selected') || (seat2?.state==='selected')
                let clsPair = clsCoupleEmpty
                if (bookedPair) clsPair = clsBooked
                else if (selectedPair) clsPair = clsSelected
                const pairIndex = Math.ceil(colNum/2)
                const pairLabel = `${pairIndex}`
                const handleClick = () => {
                  if (bookedPair) return
                  if (seat2) toggleMany([seat.id, seat2.id])
                  else toggle(seat.id)
                }
                // Insert spacer before seat if current col is aisle (we still render seat)
                const spacer = isAisle ? <div key={`sp-${c}`} className="w-8" /> : null
                return <React.Fragment key={c}>{spacer}<div className={basePair + " " + clsPair} onClick={handleClick}>{pairLabel}</div></React.Fragment>
              }

              // Normal / VIP seats
              let cls = clsEmpty
              if (seat.state==='booked') cls = clsBooked
              else if (seat.state==='selected') cls = clsSelected
              else if (seat.type==='vip') cls = clsVipEmpty
              const spacer = isAisle ? <div key={`sp-${c}`} className="w-8" /> : null
              return <React.Fragment key={c}>{spacer}<div className={baseSingle + " " + cls} onClick={()=> seat.state!=='booked' && toggle(seat.id)}>{seat.col}</div></React.Fragment>
            })}
            <span className="absolute right-0 w-8 text-left">{String.fromCharCode(65+r)}</span>
          </div>
          </React.Fragment>
        )})}
      </div>
      <div className="flex flex-wrap items-center gap-3 justify-center">
        {legend.map(([cls, label]) => (
          <div key={label} className="flex items-center gap-2">
            <div className={"h-4 w-4 rounded " + cls}></div>
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
