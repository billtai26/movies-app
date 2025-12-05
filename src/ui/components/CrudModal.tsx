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

  const change = (k: string, v: any) =>
    setForm((f: any) => ({ ...f, [k]: v }));

  // helper: lấy nhãn hiển thị cho select khi readOnly
  const getSelectLabel = (field: FieldSchema, v: any) => {
    const opts = field.options || [];
    if (Array.isArray(opts) && opts.length > 0) {
      if (typeof opts[0] === "string") {
        return String(v ?? "");
      }
      const found = (opts as Array<{label:string; value:string}>).find(o => o.value === v);
      return found ? found.label : String(v ?? "");
    }
    return String(v ?? "");
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl overflow-visible">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <button className="btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>

        {/* Form fields */}
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
                      // 👉 THÊM DÒNG NÀY ĐỂ KHÓA Ô CHỌN
                      disabled={isDisabled}
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
        </div>

        {/* Footer */}
        <div className="mt-4 text-right">
          {!readOnly ? (
            <button className="btn-primary" onClick={() => onSubmit(form)}>
              Lưu
            </button>
          ) : (
            <button className="btn-secondary" onClick={onClose}>
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
