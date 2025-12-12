import React from 'react'

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

  // Tính toán danh sách hàng và số cột tối đa
  const { rowLabels, cols } = React.useMemo(() => {
    if (seats.length === 0) return { rowLabels: [], cols: 0 };
    
    // Lấy danh sách hàng duy nhất và sắp xếp A-Z
    const rowsSet = new Set(seats.map(s => s.row));
    const rowLabels = Array.from(rowsSet).sort();
    
    // Tìm số cột lớn nhất
    const cols = Math.max(...seats.map(s => s.col));
    
    return { rowLabels, cols };
  }, [seats]);

  const legend: [string, string][] = [
    ['bg-gray-800 text-white', 'Đã bán'],
    ['bg-orange-500 text-white', 'Đang chọn'],
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
            // Kiểm tra xem có cần thêm khoảng cách lối đi ngang không
            const prevLetter = r > 0 ? rowLabels[r - 1] : ''
            const addSpacer = r > 0 && aisleRows.includes(prevLetter)

            return (
              <React.Fragment key={rowLabel}>
                {addSpacer && <div className="h-6" />}
                
                <div className="flex items-center justify-center gap-1.5">
                  {/* Label hàng bên trái */}
                  <span className="w-6 text-right font-bold text-gray-500 text-xs">{rowLabel}</span>
                  
                  {Array.from({ length: cols }).map((_, c) => {
                    const colNum = c + 1
                    const isAisle = aisleCols.includes(colNum)
                    const spacer = isAisle ? <div key={`sp-${c}`} className="w-8" /> : null

                    // Tìm ghế tại vị trí này
                    const seat = seats.find(s => s.row === rowLabel && s.col === colNum)

                    // Nếu không có ghế tại vị trí này -> Render khoảng trống
                    if (!seat) return <React.Fragment key={c}>{spacer}<div className="w-8 h-8" /></React.Fragment>

                    // --- LOGIC GHẾ ĐÔI ---
                    if (seat.type === 'couple') {
                        // Nếu là cột chẵn (2, 4...) -> Bỏ qua vì đã được vẽ gộp ở cột lẻ trước đó
                        if (seat.col % 2 === 0) {
                             return <React.Fragment key={c}>{spacer}</React.Fragment>;
                        }

                        // Nếu là cột lẻ -> Tìm ghế cặp tiếp theo
                        const nextSeat = seats.find(s => s.row === rowLabel && s.col === colNum + 1);
                        
                        // TRƯỜNG HỢP ĐẶC BIỆT: Nếu là ghế đôi nhưng không tìm thấy cặp (lẻ loi)
                        // -> Ta vẽ nó như ghế đơn nhưng style ghế đôi (để không bị mất)
                        if (!nextSeat) {
                            let singleCoupleClass = "h-8 w-8 rounded-md text-[10px] flex items-center justify-center cursor-pointer font-bold transition-all shadow-sm ";
                            // ... (Logic style giống ghế đơn nhưng màu xanh) ...
                             singleCoupleClass += "bg-blue-50 border-2 border-blue-400 text-blue-600 hover:bg-blue-100";
                             
                            return (
                                <React.Fragment key={c}>
                                  {spacer}
                                  <div className={singleCoupleClass}>{seat.col}</div>
                                </React.Fragment>
                            )
                        }

                        // Logic vẽ ghế đôi bình thường (khi có đủ cặp)
                        const idsToToggle = [seat.id, nextSeat.id];
                        const isBooked = seat.state === 'booked' || nextSeat?.state === 'booked' || seat.state === 'held' || nextSeat?.state === 'held';
                        const isSelected = seat.state === 'selected' || nextSeat?.state === 'selected';

                        let coupleClass = "h-8 w-[4.5rem] rounded-md text-[10px] flex items-center justify-center cursor-pointer font-bold transition-all shadow-sm ";
                        if (isBooked) coupleClass += "bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700";
                        else if (isSelected) coupleClass += "bg-orange-500 text-white border border-orange-600 shadow-md transform scale-105";
                        else coupleClass += "bg-blue-50 border-2 border-blue-400 text-blue-600 hover:bg-blue-100 hover:border-blue-500";

                        return (
                            <React.Fragment key={c}>
                              {spacer}
                              <div 
                                className={coupleClass}
                                onClick={() => {
                                  if (isBooked) return;
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
                    const isBooked = seat.state === 'booked' || seat.state === 'held';
                    
                    if (isBooked) seatClass += "bg-gray-800 text-gray-500 cursor-not-allowed";
                    else if (seat.state === 'selected') seatClass += "bg-orange-500 text-white shadow-md transform scale-105";
                    else if (seat.type === 'vip') seatClass += "bg-white border border-yellow-500 text-gray-700 hover:bg-yellow-50";
                    else seatClass += "bg-white border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50";

                    return (
                      <React.Fragment key={c}>
                        {spacer}
                        <div 
                          className={seatClass}
                          onClick={() => {
                            if (isBooked) return;
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
                  
                  {/* Label hàng bên phải */}
                  <span className="w-6 text-left font-bold text-gray-500 text-xs">{rowLabel}</span>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Chú thích */}
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