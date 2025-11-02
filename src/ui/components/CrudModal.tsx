import React from "react";
import { FieldSchema } from "../../types/entities";
import CustomSelect from "./CustomSelect";

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

  // helper: lấy nhãn hiển thị cho select khi readOnly
  const getSelectLabel = (field: FieldSchema, v: any) => {
    const opts = field.options || [];
    if (Array.isArray(opts) && opts.length > 0) {
      if (typeof opts[0] === "string") {
        return String(v ?? "");
      }
      const found = (opts as Array<{ label: string; value: string }>).find(
        (o) => o.value === v
      );
      return found ? found.label : String(v ?? "");
    }
    return String(v ?? "");
  };

  // helper: hiển thị ảnh preview nếu có
  const imageUrl =
    value?.imageUrl || value?.poster || value?.image || value?.avatar;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
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
            {/* Hiển thị ảnh nếu có */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="preview"
                className="w-full h-56 object-cover rounded-lg border border-gray-300 dark:border-gray-700 mb-3 hover:scale-[1.02] transition-transform"
              />
            )}

            {/* Thông tin các trường */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {fields.map((f) => (
                <div key={f.key}>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    {f.label}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {f.type === "select"
                      ? getSelectLabel(f, form[f.key])
                      : String(form[f.key] ?? "—")}
                  </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {fields.map((f) => {
              const isDisabled = readOnly || (f as any).disabled;
              const common = {
                placeholder: f.placeholder || "",
                disabled: isDisabled,
              } as any;

              return (
                <div
                  key={f.key}
                  className={`${f.type === "textarea" ? "md:col-span-2" : ""}`}
                >
                  <label className="label">{f.label}</label>

                  {/* SELECT */}
                  {f.type === "select" ? (
                    readOnly ? (
                      <input
                        className="input"
                        value={getSelectLabel(f, form[f.key])}
                        readOnly
                      />
                    ) : (
                      <CustomSelect
                        value={form[f.key] || ""}
                        onChange={(v) => change(f.key, v)}
                        options={f.options || []}
                        placeholder="-- Chọn --"
                      />
                    )
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
                      value={form[f.key] || ""}
                      onChange={(e) => change(f.key, e.target.value)}
                      {...common}
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
                onClick={() => onSubmit(form)}
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
