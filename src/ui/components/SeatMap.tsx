import React, { useMemo, useState } from "react";

type SeatState = "empty" | "booked" | "selected";
type SeatType = "normal" | "vip" | "couple";
type Seat = { id: string; row: string; col: number; type: SeatType; state: SeatState };

function genSeats(
  rows: number,
  leftCols: number,
  midCols: number,
  rightCols: number,
  vipRows: string[] = [],
  coupleRows: string[] = []
): Seat[] {
  const rs: Seat[] = [];
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, rows).split("");
  for (let r = 0; r < rows; r++) {
    const row = letters[r];
    let colIndex = 1;

    // Left block
    for (let c = 1; c <= leftCols; c++, colIndex++) {
      const type = vipRows.includes(row) ? "vip" : "normal";
      const state: SeatState = Math.random() < 0.05 ? "booked" : "empty";
      rs.push({ id: `${row}${colIndex}`, row, col: colIndex, type, state });
    }

    // Middle block
    for (let c = 1; c <= midCols; c++, colIndex++) {
      const type = coupleRows.includes(row)
        ? "couple"
        : vipRows.includes(row)
        ? "vip"
        : "normal";
      const state: SeatState = Math.random() < 0.05 ? "booked" : "empty";
      rs.push({ id: `${row}${colIndex}`, row, col: colIndex, type, state });
    }

    // Right block
    for (let c = 1; c <= rightCols; c++, colIndex++) {
      const type = vipRows.includes(row) ? "vip" : "normal";
      const state: SeatState = Math.random() < 0.05 ? "booked" : "empty";
      rs.push({ id: `${row}${colIndex}`, row, col: colIndex, type, state });
    }
  }
  return rs;
}

export default function SeatMap({
  rows = 12,
  leftCols = 3,
  midCols = 10,
  rightCols = 3,
  vipRows = ["A", "B"],
  coupleRows = ["K", "L"],
  onChange,
}: {
  rows?: number;
  leftCols?: number;
  midCols?: number;
  rightCols?: number;
  vipRows?: string[];
  coupleRows?: string[];
  onChange?: (ids: string[]) => void;
}) {
  const [seats, setSeats] = useState<Seat[]>(() =>
    genSeats(rows, leftCols, midCols, rightCols, vipRows, coupleRows)
  );

  const selected = useMemo(
    () => seats.filter((s) => s.state === "selected").map((s) => s.id),
    [seats]
  );

  const toggle = (id: string) => {
    setSeats((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              state: s.state === "empty" ? "selected" : s.state === "selected" ? "empty" : s.state,
            }
          : s
      )
    );
  };

  React.useEffect(() => {
    onChange && onChange(selected);
  }, [selected]);

  const legend = [
    ["bg-gray-200", "Trống"],
    ["bg-emerald-500 text-white", "Đang chọn"],
    ["bg-gray-800 text-white", "Đã đặt"],
    ["bg-amber-500 text-white", "VIP"],
    ["bg-pink-500 text-white", "Ghế đôi"],
  ];

  return (
    <div className="space-y-4 text-center select-none">
      {/* Màn hình */}
      <div className="mx-auto w-3/4 rounded-t-2xl bg-gray-900 py-3 text-white font-medium shadow-md">
        Màn hình
      </div>

      {/* Cửa vào / ra */}
      <div className="flex justify-between items-center text-sm font-medium text-gray-700 max-w-6xl mx-auto mb-4 px-6">
  <div className="flex items-center gap-2 text-amber-700">
    <span className="text-xl">🚪</span>
    <span className="tracking-wide">Cửa vào</span>
  </div>
  <div className="flex items-center gap-2 text-amber-700">
    <span className="tracking-wide">Cửa ra</span>
    <span className="text-xl">🚪</span>
  </div>
</div>

      {/* Ghế */}
      <div
        className="mx-auto max-w-5xl bg-white dark:bg-gray-900 rounded-xl py-4 shadow-inner
                   max-h-[500px] overflow-y-auto scroll-smooth"
      >
        {Array.from({ length: rows }).map((_, r) => {
          const rowChar = String.fromCharCode(65 + r);
          const rowSeats = seats.filter((s) => s.row === rowChar);

          return (
            <div key={r} className="mb-2 flex items-center justify-center gap-3">
              <span className="w-5 text-right text-sm font-medium">{rowChar}</span>

              {/* Left section */}
              <div className="flex gap-[3px] mr-5">
                {rowSeats.slice(0, leftCols).map((seat) => {
                  let cls = "bg-gray-200";
                  if (seat.state === "booked") cls = "bg-gray-800 text-white cursor-not-allowed";
                  if (seat.state === "selected") cls = "bg-emerald-500 text-white";
                  if (seat.type === "vip" && seat.state === "empty") cls = "bg-amber-500 text-white";
                  return (
                    <div
                      key={seat.id}
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] cursor-pointer hover:scale-110 transition ${cls}`}
                      onClick={() => seat.state !== "booked" && toggle(seat.id)}
                      title={`Ghế ${seat.id}`}
                    >
                      {seat.col}
                    </div>
                  );
                })}
              </div>

              {/* Middle section */}
              <div className="flex gap-[3px] mx-6">
                {rowSeats.slice(leftCols, leftCols + midCols).map((seat) => {
                  let cls = "bg-gray-200";
                  if (seat.state === "booked") cls = "bg-gray-800 text-white cursor-not-allowed";
                  if (seat.state === "selected") cls = "bg-emerald-500 text-white";
                  if (seat.type === "vip" && seat.state === "empty") cls = "bg-amber-500 text-white";
                  if (seat.type === "couple" && seat.state === "empty") cls = "bg-pink-500 text-white";
                  return (
                    <div
                      key={seat.id}
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] cursor-pointer hover:scale-110 transition ${cls}`}
                      onClick={() => seat.state !== "booked" && toggle(seat.id)}
                      title={`Ghế ${seat.id}`}
                    >
                      {seat.col}
                    </div>
                  );
                })}
              </div>

              {/* Right section */}
              <div className="flex gap-[3px] ml-5">
                {rowSeats.slice(leftCols + midCols).map((seat) => {
                  let cls = "bg-gray-200";
                  if (seat.state === "booked") cls = "bg-gray-800 text-white cursor-not-allowed";
                  if (seat.state === "selected") cls = "bg-emerald-500 text-white";
                  if (seat.type === "vip" && seat.state === "empty") cls = "bg-amber-500 text-white";
                  return (
                    <div
                      key={seat.id}
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] cursor-pointer hover:scale-110 transition ${cls}`}
                      onClick={() => seat.state !== "booked" && toggle(seat.id)}
                      title={`Ghế ${seat.id}`}
                    >
                      {seat.col}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ghi chú */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {legend.map(([cls, label]) => (
          <div key={label as string} className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded ${cls}`}></div>
            <span className="text-sm text-gray-600">{label as string}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
