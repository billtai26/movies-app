import React from 'react'

// Các kiểu (types) này được giữ nguyên
type SeatState = 'empty'|'held'|'booked'|'selected'
type Seat = { id:string, row:string, col:number, type:'normal'|'vip'|'couple', state:SeatState }

export default function SeatMap({
  seats,
  aisleCols=[],
  aisleRows=[],
  maxSelected=Infinity,
  onLimitExceeded,
  onToggle,
  onToggleMany,
}: {
  seats: Seat[], // <--- NHẬN MẢNG SEATS TỪ BÊN NGOÀI
  aisleCols?:number[],
  aisleRows?:string[],
  maxSelected?:number,
  onLimitExceeded?:()=>void,
  onToggle: (id: string) => void, // <--- HÀM GỌI KHI NHẤN GHẾ ĐƠN
  onToggleMany: (ids: string[]) => void, // <--- HÀM GỌI KHI NHẤN GHẾ ĐÔI
}){

  // Tự động tính toán số hàng/cột từ mảng seats
  const { rowLabels, cols } = React.useMemo(() => {
    if (seats.length === 0) {
      return { rowLabels: [], cols: 0 };
    }
    // Lấy danh sách tên hàng (A, B, C...)
    const rowsSet = new Set(seats.map(s => s.row));
    const rowLabels = Array.from(rowsSet).sort();
    
    // Tìm số cột lớn nhất
    const cols = Math.max(...seats.map(s => s.col));
    
    return { rowLabels, cols };
  }, [seats]);

  const legend:[string,string][] = [
    ['bg-gray-800 text-white','Ghế đã bán/Giữ'], // Gộp chung
    ['bg-orange-500','Ghế đang chọn'],
    ['border border-yellow-500 bg-white','Ghế VIP'],
    ['bg-pink-500','Ghế đôi'],
    ['bg-white border border-gray-300','Trống'],
  ]

  const currentlySelected = React.useMemo(() => {
    return seats.filter(s => s.state === 'selected').length
  }, [seats])

  return (
    <div className="space-y-4">
      <div className="w-full rounded-xl bg-gray-900 p-2 text-center text-white">Màn hình</div>
      <div className="mx-auto max-w-5xl overflow-x-auto">
        {/* Dùng `rowLabels` thay vì `rows` */}
        {rowLabels.map((rowLabel, r) => {
          const prevLetter = r > 0 ? rowLabels[r - 1] : ''
          const addSpacer = r > 0 && aisleRows.includes(prevLetter)
          
          return (
          <React.Fragment key={rowLabel}>
          {addSpacer && <div className="h-4" />}
          <div key={`row-${rowLabel}`} className="mb-2 relative flex items-center justify-center gap-1">
            <span className="absolute left-0 w-8 text-right">{rowLabel}</span>
            {/* Dùng `cols` thay vì `cols` prop */}
            {Array.from({length: cols}).map((_, c) => {
              const colNum = c + 1
              const isAisle = aisleCols.includes(colNum)
              
              // Tìm ghế dựa trên `rowLabel`
              const seat = seats.find(s => s.row === rowLabel && s.col === colNum)
              
              if (!seat) return <div key={c} className="w-8" />
              
              const baseSingle = "h-8 w-8 rounded-md text-xs flex items-center justify-center cursor-pointer"
              const basePair = "h-8 w-16 rounded-md text-[10px] flex items-center justify-center cursor-pointer"
              const clsBookedOrHeld = "bg-gray-800 text-white cursor-not-allowed" // <-- Khóa cả 'booked' và 'held'
              const clsSelected = "bg-orange-500 text-white"
              const clsEmpty = "bg-white border border-gray-300"
              const clsVipEmpty = "bg-white border border-yellow-500"
              const clsCoupleEmpty = "bg-pink-500 text-white"

              // Logic ghế đôi
              if (seat.type==='couple'){
                if (colNum % 2 === 0){
                  return <div key={c} className="w-0" />
                }
                
                const nextCol = colNum + 1
                const nextIsAisle = aisleCols.includes(nextCol)
                
                if (nextIsAisle){
                  let cls = clsCoupleEmpty
                  if (seat.state==='booked' || seat.state==='held') cls = clsBookedOrHeld
                  else if (seat.state==='selected') cls = clsSelected
                  
                  return <div 
                    key={c} 
                    className={baseSingle + " " + cls} 
                    onClick={() => {
                      if (seat.state === 'booked' || seat.state === 'held') return;
                      if (seat.state === 'empty' && currentlySelected + 1 > maxSelected) {
                        onLimitExceeded && onLimitExceeded();
                        return;
                      }
                      onToggle(seat.id); // <--- GỌI PROP
                    }}
                  >{seat.col}</div>
                }
                
                const seat2 = seats.find(s => s.row===seat.row && s.col===nextCol)
                const bookedPair = (seat.state==='booked') || (seat2?.state==='booked')
                const heldPair = (seat.state==='held') || (seat2?.state==='held') // <-- Kiểm tra 'held'
                const selectedPair = (seat.state==='selected') || (seat2?.state==='selected')
                
                let clsPair = clsCoupleEmpty
                if (bookedPair || heldPair) clsPair = clsBookedOrHeld
                else if (selectedPair) clsPair = clsSelected
                
                const pairIndex = Math.ceil(colNum/2)
                const pairLabel = `${pairIndex}`
                
                const handleClick = () => {
                  if (bookedPair || heldPair) return; // <-- Khóa
                  
                  const idsToToggle = seat2 ? [seat.id, seat2.id] : [seat.id];
                  
                  // Chỉ kiểm tra maxSelected nếu đang *thêm* ghế
                  if (!selectedPair) {
                    const addingCount = idsToToggle.length;
                    if (currentlySelected + addingCount > maxSelected) {
                      onLimitExceeded && onLimitExceeded();
                      return;
                    }
                  }
                  onToggleMany(idsToToggle); // <--- GỌI PROP
                }
                
                const spacer = isAisle ? <div key={`sp-${c}`} className="w-8" /> : null
                return <React.Fragment key={c}>{spacer}<div className={basePair + " " + clsPair} onClick={handleClick}>{pairLabel}</div></React.Fragment>
              }

              // Logic ghế thường / VIP
              let cls = clsEmpty
              if (seat.state==='booked' || seat.state==='held') cls = clsBookedOrHeld // <-- Khóa 'held'
              else if (seat.state==='selected') cls = clsSelected
              else if (seat.type==='vip') cls = clsVipEmpty
              
              const spacer = isAisle ? <div key={`sp-${c}`} className="w-8" /> : null
              
              return <React.Fragment key={c}>
                {spacer}
                <div 
                  className={baseSingle + " " + cls} 
                  onClick={() => {
                    if (seat.state === 'booked' || seat.state === 'held') return; // <-- Khóa
                    
                    // Kiểm tra maxSelected chỉ khi *thêm* ghế
                    if (seat.state === 'empty' && currentlySelected + 1 > maxSelected) {
                      onLimitExceeded && onLimitExceeded();
                      return;
                    }
                    onToggle(seat.id); // <--- GỌI PROP
                  }}
                >
                  {seat.col}
                </div>
              </React.Fragment>
            })}
            <span className="absolute right-0 w-8 text-left">{rowLabel}</span>
          </div>
          </React.Fragment>
        )})}
      </div>
      
      {/* Phần chú thích (legend) giữ nguyên */}
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
