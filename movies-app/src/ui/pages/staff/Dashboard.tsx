
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'
import { api } from '../../../lib/mockApi'


const genWeek = () =>
  ['T2','T3','T4','T5','T6','T7','CN'].map(d => ({
    day: d,
    checkin: Math.floor(40 + Math.random()*60),
    revenue: Math.floor(8 + Math.random()*20) * 100_000,
  }))

const COLORS = ['#22c55e','#ef4444']

export default function StaffDashboard() {
  const [week, setWeek] = React.useState(genWeek())
  const [today, setToday] = React.useState({ checked: 124, combos: 86, incidents: 3 })
  const totalCheckin = week.reduce((s, x) => s + x.checkin, 0)
  const totalCapacity = 7 * 120
  const notCheckin = Math.max(totalCapacity - totalCheckin, 0)

  const refresh = () => {
    setWeek(genWeek())
    setToday({
      checked: Math.floor(80 + Math.random()*120),
      combos: Math.floor(40 + Math.random()*60),
      incidents: Math.floor(Math.random()*5),
    })
    toast.success('Đã làm mới số liệu')
  }

  React.useEffect(() => { api.listShowtimes().then(()=>{}) }, [])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tổng quan</h1>
        <button className="btn-primary" onClick={refresh}>Làm mới dữ liệu</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card"><div className="text-sm opacity-70 text-gray-800 dark:text-white">Vé đã check-in hôm nay</div><div className="text-2xl font-bold">{today.checked}</div></div>
        <div className="card"><div className="text-sm opacity-70 text-gray-900 dark:text-gray-100">Combo đã giao</div><div className="text-2xl font-bold">{today.combos}</div></div>
        <div className="card"><div className="text-sm opacity-70 text-gray-900 dark:text-gray-100">Sự cố mới</div><div className="text-2xl font-bold">{today.incidents}</div></div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card h-80">
          <div className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Tỷ lệ check-in tuần này</div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[{ name:'Đã check-in', value: totalCheckin },{ name:'Chưa check-in', value: notCheckin }]} dataKey="value" innerRadius="60%" outerRadius="80%" paddingAngle={4}>
                {[0,1].map(i => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-80">
          <div className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Vé check-in theo ngày (7 ngày)</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" /><YAxis /><Tooltip />
              <Bar dataKey="checkin" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card h-80">
        <div className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Doanh thu theo ngày (VND)</div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={week}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" /><YAxis /><Tooltip formatter={(v:number)=>v.toLocaleString('vi-VN')+' ₫'} />
            <Bar dataKey="revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
