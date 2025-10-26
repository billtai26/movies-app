import React from 'react'

interface Column<T> {
  key: keyof T
  label: string
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
            const isSelected =
              selectedRow && (selectedRow as any).id === (r as any).id
            return (
              <tr
                key={idx}
                onClick={() => onRowClick && onRowClick(r)}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'odd:bg-gray-50 dark:odd:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {columns.map((c) => (
                  <td key={String(c.key)} className="p-2">
                    {String(r[c.key])}
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
