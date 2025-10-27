
import React from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
const data = Array.from({length:12}).map((_,i)=>({month:`T${i+1}`, revenue: Math.round(Math.random()*50)+10}))
export default function Revenue(){
  return (
    <div className="space-y-4">
      <div className="text-xl font-bold">Thống kê doanh thu</div>
      <div className="card h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis/><Tooltip/><Line dataKey="revenue" /></LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
