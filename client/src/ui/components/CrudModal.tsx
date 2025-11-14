import React from "react";
import { FieldSchema } from "../../types/entities";
import CustomSelect from "./CustomSelect";
import LayoutEditor from "./LayoutEditor";
import { toLocalInput, formatVN } from "../../lib/datetime";

export default function CrudModal({
  open,
  title,
  fields,
  value,
  onClose,
  onSubmit,
  readOnly = false,
}: {
  open: boolean;
  title: string;
  fields: FieldSchema[];
  value: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  readOnly?: boolean;
}) {
  const [form, setForm] = React.useState<any>(value || {});
  React.useEffect(() => {
    setForm(value || {});
  }, [value]);

  if (!open) return null;

  const change = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const getSelectLabel = (field: FieldSchema, v: any) => {
    const opts = field.options || [];
    if (Array.isArray(opts) && opts.length > 0) {
      if (typeof opts[0] === "string") return String(v ?? "");
      const found = (opts as Array<{ label: string; value: string }>).find(
        (o) => o.value === v
      );
      return found ? found.label : String(v ?? "");
    }
    return String(v ?? "");
  };

  const imageUrl =
    value?.imageUrl || value?.poster || value?.image || value?.avatar;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>

        {/* ================== VIEW MODE ================== */}
        {readOnly ? (
          <div className="space-y-4 text-gray-800 dark:text-gray-200">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="preview"
                className="w-full h-56 object-cover rounded-lg border border-gray-300 dark:border-gray-700 mb-3 hover:scale-[1.02] transition-transform"
              />
            )}

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {fields.map((f) => (
                <div key={f.key}>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    {f.label}
                  </p>
                  {f.type === "layout" ? (
                    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 mt-1">
                      <SeatPreview seats={form["seats"] || []} />
                    </div>
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {f.type === "select"
                        ? getSelectLabel(f, form[f.key])
                        : f.type === "datetime"
                        ? formatVN(form[f.key])
                        : String(form[f.key] ?? "—")}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="text-right pt-3">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-md bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* ================== EDIT/ADD MODE ================== */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-1">
            {fields.map((f) => {
              const isDisabled = readOnly || (f as any).disabled;
              const common = {
                placeholder: f.placeholder || "",
                disabled: isDisabled,
              } as any;

              return (
                <div
                  key={f.key}
                  className={`${
                    f.type === "textarea" || f.type === "layout"
                      ? "md:col-span-2"
                      : ""
                  }`}
                >
                  <label className="label">{f.label}</label>

                  {/* SELECT */}
                  {f.type === "select" ? (
                    <CustomSelect
                      value={form[f.key] || ""}
                      onChange={(v) => change(f.key, v)}
                      options={f.options || []}
                      placeholder="-- Chọn --"
                    />
                  ) : f.type === "textarea" ? (
                    <textarea
                      className="input h-28"
                      value={form[f.key] || ""}
                      onChange={(e) => change(f.key, e.target.value)}
                      {...common}
                    />
                  ) : f.type === "number" ? (
                    <input
                      type="number"
                      className="input"
                      value={form[f.key] ?? ""}
                      onChange={(e) => change(f.key, Number(e.target.value))}
                      {...common}
                    />
                  ) : f.type === "datetime" ? (
                    <input
                      type="datetime-local"
                      className="input"
                      value={toLocalInput(form[f.key])}
                      onChange={(e) => change(f.key, e.target.value)}
                      {...common}
                    />
                  ) : f.type === "boolean" ? (
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={!!form[f.key]}
                        onChange={(e) => change(f.key, e.target.checked)}
                        {...common}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        {f.placeholder || "Bật / Tắt"}
                      </span>
                    </label>
                  ) : f.type === "image" ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="input"
                        value={form[f.key] || ""}
                        onChange={(e) => change(f.key, e.target.value)}
                        {...common}
                      />
                      {form[f.key] && (
                        <img
                          src={form[f.key]}
                          alt="preview"
                          className="w-full h-40 object-cover rounded-md border border-gray-300"
                        />
                      )}
                    </div>
                  ) : f.type === "layout" ? (
                    <LayoutEditor
                      value={form[f.key] || []}
                      onChange={(v) => change(f.key, v)}
                    />
                  ) : (
                    <input
                      className="input"
                      value={form[f.key] || ""}
                      onChange={(e) => change(f.key, e.target.value)}
                      {...common}
                    />
                  )}
                </div>
              );
            })}

            {/* Footer */}
            <div className="md:col-span-2 text-right mt-2">
              <button
                className="btn-primary"
                onClick={() => {
                  let payload = { ...form };

                  // 🧩 map layout → seats[] cho Phòng & Ghế
                  if (Array.isArray(form.layout)) {
                    payload = {
                      roomName: form.roomName,
                      theater: form.theater,
                      seats: form.layout.flatMap((r: any) =>
                        Array.from({ length: r.count }).map((_, i) => ({
                          seatNumber: `${r.row}${i + 1}`,
                          type: r.type,
                          isBooked: false,
                        }))
                      ),
                    };
                  }

                  onSubmit(payload);
                  setForm({});
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================================================
   🎬 SeatPreview — hiển thị sơ đồ ghế khi xem chi tiết
====================================================== */
function SeatPreview({ seats }: { seats: any[] }) {
  if (!seats || seats.length === 0)
    return <p className="text-sm text-gray-400">Không có ghế nào.</p>;

  const grouped = seats.reduce((acc: any, s: any) => {
    const row = s.seatNumber?.[0] || "?";
    acc[row] = acc[row] || [];
    acc[row].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-4 overflow-x-auto">
      {Object.keys(grouped).map((row) => (
        <div key={row}>
          <p className="text-xs text-gray-500 mb-1 font-medium">Hàng {row}</p>
          <div className="flex flex-wrap gap-1">
            {grouped[row].map((seat: any) => (
              <div
                key={seat.seatNumber}
                title={seat.seatNumber}
                className={[
                  "w-8 h-7 flex items-center justify-center text-[11px] font-mono rounded select-none",
                  seat.type === "VIP"
                    ? "bg-yellow-300 dark:bg-yellow-600/40 border border-yellow-500 text-yellow-900 dark:text-yellow-100"
                    : seat.type === "COUPLE"
                    ? "bg-pink-300 dark:bg-pink-700/50 border border-pink-500 text-pink-900 dark:text-pink-100"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100",
                ].join(" ")}
              >
                {seat.seatNumber}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
