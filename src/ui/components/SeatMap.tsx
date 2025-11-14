import React, { useMemo, useState, useEffect } from "react";

type Seat = {
  seatNumber: string;
  type?: "STANDARD" | "VIP" | "COUPLE";
  isBooked?: boolean;
};

type Props = {
  seats?: Seat[];
  onChange?: (selectedSeats: string[]) => void;
};

export default function SeatMap({ seats = [], onChange }: Props) {
  // 💺 chuyển seats BE -> local state có trạng thái
  const [localSeats, setLocalSeats] = useState<
    (Seat & { state: "empty" | "selected" | "booked" })[]
  >([]);

  useEffect(() => {
    const mapped = seats.map((s) => ({
      ...s,
      state: s.isBooked ? "booked" : "empty",
    }));
    setLocalSeats(mapped);
  }, [seats]);

  // Danh sách ghế đã chọn
  const selected = useMemo(
    () => localSeats.filter((s) => s.state === "selected").map((s) => s.seatNumber),
    [localSeats]
  );

  useEffect(() => {
    onChange?.(selected);
  }, [selected]);

  // Toggle chọn ghế
  const toggleSeat = (seatNumber: string) => {
    setLocalSeats((prev) =>
      prev.map((s) =>
        s.seatNumber === seatNumber
          ? {
              ...s,
              state:
                s.state === "empty"
                  ? "selected"
                  : s.state === "selected"
                  ? "empty"
                  : s.state,
            }
          : s
      )
    );
  };

  // Gom ghế theo hàng (A, B, C,...)
  const grouped = useMemo(() => {
    const map: Record<string, Seat[]> = {};
    localSeats.forEach((s) => {
      const row = s.seatNumber[0];
      map[row] = map[row] || [];
      map[row].push(s);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => {
        const aNum = parseInt(a.seatNumber.slice(1));
        const bNum = parseInt(b.seatNumber.slice(1));
        return aNum - bNum;
      })
    );
    return map;
  }, [localSeats]);

  const legend = [
    ["bg-gray-200", "Trống"],
    ["bg-emerald-500 text-white", "Đang chọn"],
    ["bg-gray-800 text-white", "Đã đặt"],
    ["bg-yellow-400 text-black", "VIP"],
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
      <div className="mx-auto max-w-5xl bg-white dark:bg-gray-900 rounded-xl py-4 shadow-inner max-h-[500px] overflow-y-auto scroll-smooth">
        {Object.keys(grouped)
          .sort()
          .map((row) => (
            <div key={row} className="mb-2 flex items-center justify-center gap-3">
              <span className="w-5 text-right text-sm font-medium">{row}</span>

              <div className="flex flex-wrap gap-[3px]">
                {grouped[row].map((seat) => {
                  let cls = "bg-gray-200";
                  if (seat.state === "booked")
                    cls = "bg-gray-800 text-white cursor-not-allowed";
                  if (seat.state === "selected")
                    cls = "bg-emerald-500 text-white";
                  else if (seat.type === "VIP" && seat.state === "empty")
                    cls = "bg-yellow-400 text-black";
                  else if (seat.type === "COUPLE" && seat.state === "empty")
                    cls = "bg-pink-500 text-white";

                  return (
                    <div
                      key={seat.seatNumber}
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] cursor-pointer hover:scale-110 transition ${cls}`}
                      onClick={() =>
                        seat.state !== "booked" && toggleSeat(seat.seatNumber)
                      }
                      title={`Ghế ${seat.seatNumber}`}
                    >
                      {seat.seatNumber.slice(1)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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
