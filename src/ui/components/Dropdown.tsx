import React from "react";

type Option = { label: string; value: string };

export default function Dropdown({
  value,
  onChange,
  options,
  className = "",
  minWidth = 160,
}: {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  className?: string;
  minWidth?: number;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value)?.label || options[0]?.label || "Chọn";

  React.useEffect(() => {
    function handle(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ minWidth }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-1.5 text-sm bg-white ${
          open ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300"
        }`}
      >
        <span>{current}</span>
        <span className="ml-2 text-gray-500">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                className={`block w-full text-left px-3 py-2 text-sm ${
                  active
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}