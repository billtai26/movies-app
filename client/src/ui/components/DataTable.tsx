
import React from 'react'
export default function DataTable<T>({ rows, columns }:{ rows:T[], columns:{key:keyof T,label:string}[] }){
  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead><tr className="text-left">
          {columns.map(c => <th key={String(c.key)} className="border-b p-2 font-semibold">{c.label}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="odd:bg-gray-50">
              {columns.map(c => <td key={String(c.key)} className="p-2">{String(r[c.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
