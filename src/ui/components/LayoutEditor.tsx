import React from "react";

type SeatType = "STANDARD" | "VIP";

interface LayoutRow {
  row: string;
  count: number;
  type: SeatType;
}

export default function LayoutEditor({
  value = [],
  onChange,
}: {
  value: LayoutRow[];
  onChange: (rows: LayoutRow[]) => void;
}) {
  // actions
  const addRow = () =>
    onChange([...value, { row: nextRowLetter(value), count: 10, type: "STANDARD" }]);

  const updateRow = (i: number, patch: Partial<LayoutRow>) => {
    const next = [...value];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const removeRow = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={addRow}
          className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          + Thêm hàng
        </button>

        {/* Quick presets */}
        <button
          type="button"
          onClick={() =>
            onChange([
              { row: "A", count: 10, type: "STANDARD" },
              { row: "B", count: 10, type: "STANDARD" },
              { row: "C", count: 10, type: "STANDARD" },
              { row: "D", count: 8, type: "VIP" },
            ])
          }
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm"
        >
          Preset 10–10–10 + VIP 8
        </button>
      </div>

      {/* Editor rows */}
      <div className="space-y-2">
        {value.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg"
          >
            <div className="text-xs text-gray-500 w-10">Hàng</div>
            <input
              value={r.row}
              onChange={(e) =>
                updateRow(i, { row: e.target.value.toUpperCase().slice(0, 2) })
              }
              className="w-14 text-center border rounded-md px-2 py-1 dark:bg-gray-900 dark:text-white"
              placeholder="A"
            />

            <div className="text-xs text-gray-500 w-16 text-right">Ghế</div>
            <input
              type="number"
              min={1}
              max={50}
              value={r.count}
              onChange={(e) => updateRow(i, { count: clamp(+e.target.value, 1, 50) })}
              className="w-20 text-center border rounded-md px-2 py-1 dark:bg-gray-900 dark:text-white"
              placeholder="10"
            />

            <div className="text-xs text-gray-500 w-14 text-right">Loại</div>
            <select
              value={r.type}
              onChange={(e) => updateRow(i, { type: e.target.value as SeatType })}
              className="border rounded-md px-2 py-1 dark:bg-gray-900 dark:text-white"
            >
              <option value="STANDARD">STANDARD</option>
              <option value="VIP">VIP</option>
            </select>

            <button
              type="button"
              onClick={() => removeRow(i)}
              className="ml-auto text-red-500 hover:text-red-700 text-lg font-bold px-2"
              title="Xóa hàng này"
            >
              ✕
            </button>
          </div>
        ))}

        {value.length === 0 && (
          <div className="text-sm text-gray-500">
            Chưa có hàng ghế nào — nhấn <b>+ Thêm hàng</b> để bắt đầu.
          </div>
        )}
      </div>

      {/* Preview legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 h-3 rounded bg-gray-200 dark:bg-gray-700" />
          STANDARD
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 h-3 rounded bg-yellow-200 dark:bg-yellow-500/30 border border-yellow-400" />
          VIP
        </span>
      </div>

      {/* Preview screen */}
      <div className="w-full text-center">
        <div className="mx-auto w-2/3 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mb-2" />
        <div className="text-[10px] uppercase tracking-widest text-gray-500">Màn hình</div>
      </div>

      {/* Preview seats */}
      <div className="space-y-3 border rounded-lg p-3 dark:border-gray-700">
        {value.map((r, idx) => (
          <div key={idx}>
            <div className="text-xs mb-1 text-gray-600 dark:text-gray-300">
              Hàng {r.row || "?"} • {r.count} ghế • {r.type}
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: r.count || 0 }).map((_, i) => (
                <SeatBox
                  key={i}
                  label={`${r.row || "?"}${i + 1}`}
                  type={r.type}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------- helpers ----------------- */
function SeatBox({ label, type }: { label: string; type: SeatType }) {
  const vip = type === "VIP";
  return (
    <div
      className={[
        "h-7 min-w-8 px-1 rounded flex items-center justify-center text-[11px] font-mono",
        "select-none",
        vip
          ? "bg-yellow-200/70 dark:bg-yellow-500/30 border border-yellow-400 text-yellow-900 dark:text-yellow-300"
          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100",
      ].join(" ")}
      title={vip ? "VIP" : "STANDARD"}
    >
      {label}
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, isNaN(n) ? min : n));
}

function nextRowLetter(rows: LayoutRow[]) {
  // gợi ý chữ cái kế tiếp (A,B,C,...)
  const used = new Set(rows.map((r) => (r.row || "").toUpperCase()));
  for (let c = 65; c <= 90; c++) {
    const ch = String.fromCharCode(c);
    if (!used.has(ch)) return ch;
  }
  return "";
}
