
import React from 'react'
import DataTable from '../../components/DataTable'
import { api } from '../../../lib/mockApi'

export default function Showtimes(){{
  const [rows, setRows] = React.useState<any[]>([])
  React.useEffect(() => {{
    (async () => {{
      const data = await api.listShowtimes()
      setRows(data as any[])
    }})()
  }}, [])
  return (
    <div className="space-y-4">
      <div className="text-xl font-bold">Quản lý lịch chiếu</div>
      <div className="flex gap-2">
        <button className="btn-primary">Thêm</button>
        <button className="btn-outline">Sửa</button>
        <button className="btn-outline">Xóa</button>
      </div>
      <DataTable rows={rows} columns={[{ key: 'id', label: 'ID' }, { key: 'movieId', label: 'Phim' }, { key: 'startTime', label: 'Bắt đầu' }]} />
    </div>
  )
}}
