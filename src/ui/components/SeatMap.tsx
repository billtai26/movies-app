import React from 'react'

// Type đã có sẵn 'held', không cần sửa
type SeatState = 'empty' | 'held' | 'booked' | 'selected'
type Seat = { 
  id: string, 
  row: string, 
  col: number, 
  type: 'normal' | 'vip' | 'couple', 
  state: SeatState 
}

export default function SeatMap({
  seats,
  aisleCols = [],
  aisleRows = [],
  maxSelected = Infinity,
  onLimitExceeded,
  onToggle,
  onToggleMany,
}: {
  seats: Seat[],
  aisleCols?: number[],
  aisleRows?: string[],
  maxSelected?: number,
  onLimitExceeded?: () => void,
  onToggle: (id: string) => void,
  onToggleMany: (ids: string[]) => void,
}) {

  const { rowLabels, cols } = React.useMemo(() => {
    if (seats.length === 0) return { rowLabels: [], cols: 0 };
    const rowsSet = new Set(seats.map(s => s.row));
    const rowLabels = Array.from(rowsSet).sort();
    const cols = Math.max(...seats.map(s => s.col));
    return { rowLabels, cols };
  }, [seats]);

  // 1. CẬP NHẬT LEGEND: Thêm trạng thái 'Đang giữ'
  const legend: [string, string][] = [
    ['bg-gray-800 text-white', 'Đã bán'],
    ['bg-red-500 text-white', 'Người khác đang giữ'], // Thêm mục này
    ['bg-orange-500 text-white', 'Bạn đang chọn'],
    ['bg-white border border-yellow-500', 'Ghế VIP'],
    ['bg-blue-100 border-2 border-blue-400 text-blue-700', 'Ghế đôi'], 
    ['bg-white border border-gray-300', 'Trống'],
  ]

  const currentlySelected = React.useMemo(() => {
    return seats.filter(s => s.state === 'selected').length
  }, [seats])

  return (
    <div className="space-y-4 select-none">
      <div className="w-full rounded-xl bg-gray-900 p-2 text-center text-white text-sm font-medium tracking-widest uppercase shadow-lg">
        Màn hình
      </div>
      
      <div className="mx-auto max-w-full overflow-x-auto pb-4">
        <div className="min-w-max flex flex-col gap-2">
          {rowLabels.map((rowLabel, r) => {
            const prevLetter = r > 0 ? rowLabels[r - 1] : ''
            const addSpacer = r > 0 && aisleRows.includes(prevLetter)

            return (
              <React.Fragment key={rowLabel}>
                {addSpacer && <div className="h-6" />}
                
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-6 text-right font-bold text-gray-500 text-xs">{rowLabel}</span>
                  
                  {Array.from({ length: cols }).map((_, c) => {
                    const colNum = c + 1
                    const isAisle = aisleCols.includes(colNum)
                    const spacer = isAisle ? <div key={`sp-${c}`} className="w-8" /> : null
                    const seat = seats.find(s => s.row === rowLabel && s.col === colNum)

                    if (!seat) return <React.Fragment key={c}>{spacer}<div className="w-8 h-8" /></React.Fragment>

                    // --- LOGIC GHẾ ĐÔI ---
                    if (seat.type === 'couple') {
                        if (seat.col % 2 === 0) return <React.Fragment key={c}>{spacer}</React.Fragment>;

                        const nextSeat = seats.find(s => s.row === rowLabel && s.col === colNum + 1);
                        
                        if (!nextSeat) return null; // Fallback nếu dữ liệu lỗi

                        const idsToToggle = [seat.id, nextSeat.id];
                        
                        // Phân tách trạng thái
                        const isSold = seat.state === 'booked' || nextSeat?.state === 'booked';
                        const isHeld = seat.state === 'held' || nextSeat?.state === 'held'; // Người khác đang giữ
                        const isSelected = seat.state === 'selected' || nextSeat?.state === 'selected'; // Mình đang chọn

                        let coupleClass = "h-8 w-[4.5rem] rounded-md text-[10px] flex items-center justify-center cursor-pointer font-bold transition-all shadow-sm ";
                        
                        // Logic style ưu tiên: Sold -> Held -> Selected -> Empty
                        if (isSold) {
                            coupleClass += "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700";
                        } else if (isHeld) {
                            // Style cho ghế đang bị giữ (VD: Màu đỏ)
                            coupleClass += "bg-red-500 text-white cursor-not-allowed border border-red-600 opacity-90";
                        } else if (isSelected) {
                            coupleClass += "bg-orange-500 text-white border border-orange-600 shadow-md transform scale-105";
                        } else {
                            coupleClass += "bg-blue-50 border-2 border-blue-400 text-blue-600 hover:bg-blue-100 hover:border-blue-500";
                        }

                        // Disable click nếu Sold hoặc Held
                        const isDisabled = isSold || isHeld;

                        return (
                            <React.Fragment key={c}>
                              {spacer}
                              <div 
                                className={coupleClass}
                                onClick={() => {
                                  if (isDisabled) return;
                                  if (!isSelected && currentlySelected + 2 > maxSelected) {
                                    onLimitExceeded && onLimitExceeded();
                                    return;
                                  }
                                  onToggleMany(idsToToggle);
                                }}
                              >
                                  {seat.col}-{nextSeat.col}
                              </div>
                            </React.Fragment>
                        )
                    }

                    // --- LOGIC GHẾ ĐƠN (Normal/VIP) ---
                    let seatClass = "h-8 w-8 rounded-md text-xs flex items-center justify-center cursor-pointer transition-all font-medium ";
                    
                    const isSold = seat.state === 'booked';
                    const isHeld = seat.state === 'held';
                    
                    if (isSold) {
                        seatClass += "bg-gray-800 text-gray-500 cursor-not-allowed";
                    } else if (isHeld) {
                        // Style cho ghế đang bị giữ (Màu đỏ)
                        seatClass += "bg-red-500 text-white cursor-not-allowed opacity-90";
                    } else if (seat.state === 'selected') {
                        seatClass += "bg-orange-500 text-white shadow-md transform scale-105";
                    } else if (seat.type === 'vip') {
                        seatClass += "bg-white border border-yellow-500 text-gray-700 hover:bg-yellow-50";
                    } else {
                        seatClass += "bg-white border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50";
                    }

                    const isDisabled = isSold || isHeld;

                    return (
                      <React.Fragment key={c}>
                        {spacer}
                        <div 
                          className={seatClass}
                          onClick={() => {
                            if (isDisabled) return;
                            if (seat.state === 'empty' && currentlySelected + 1 > maxSelected) {
                              onLimitExceeded && onLimitExceeded();
                              return;
                            }
                            onToggle(seat.id);
                          }}
                        >
                          {seat.col}
                        </div>
                      </React.Fragment>
                    )
                  })}
                  
                  <span className="w-6 text-left font-bold text-gray-500 text-xs">{rowLabel}</span>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 justify-center py-4 border-t border-gray-100">
        {legend.map(([cls, label]) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`h-5 w-5 rounded ${cls.replace('w-[4.5rem]', 'w-5').replace('text-[10px]', 'text-[0px]')}`}></div>
            <span className="text-sm text-gray-600 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}