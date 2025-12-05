import React from 'react'

// 1. Cập nhật Interface: Thêm tùy chọn `render`
export interface Column<T> {
  key: string; // Nên đổi thành string để linh hoạt hơn, hoặc giữ keyof T cũng được
  label: string;
  render?: (row: T) => React.ReactNode; // <--- THÊM DÒNG NÀY
}

interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  selectedRow?: T | null
}

export default function DataTable<T>({
  rows,
  columns,
  onRowClick,
  selectedRow,
}: DataTableProps<T>) {
  return (
    <div className="card table-wrap overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left">
            {columns.map((c) => (
              <th key={String(c.key)} className="border-b p-2 font-semibold">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            // Lưu ý: check id an toàn hơn
            const isSelected = selectedRow && (selectedRow as any)._id === (r as any)._id 
            
            return (
              <tr
                key={idx}
                onClick={() => onRowClick && onRowClick(r)}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-100'
                    : 'odd:bg-gray-50 hover:bg-gray-200'
                }`}
              >
                {columns.map((c) => (
                  <td key={String(c.key)} className="p-2">
                    {/* 2. CẬP NHẬT LOGIC HIỂN THỊ */}
                    {c.render 
                      ? c.render(r) // Nếu có hàm render, hãy gọi nó!
                      : (r as any)[c.key] // Nếu không, lấy giá trị mặc định
                    }
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
