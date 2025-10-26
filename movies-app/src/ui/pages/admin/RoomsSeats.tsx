import React from 'react'
import DataTable from '../../components/DataTable'
import { useCollection } from '../../../lib/mockCrud'
import { seedAll } from '../../../lib/seed'

export default function RoomsSeats() {
  const { rows, create, update, remove } = useCollection<any>('rooms')
  const [selected, setSelected] = React.useState<any | null>(null)

  React.useEffect(() => {
    seedAll()
  }, [])

  const handleAdd = () => {
    const name = prompt('Nhập tên phòng mới:')
    if (name) create({ name })
  }

  const handleEdit = () => {
    if (!selected) return alert('Chọn một phòng để sửa')
    const name = prompt('Nhập tên mới:', selected.name)
    if (name) update(selected.id, { name })
  }

  const handleDelete = () => {
    if (!selected) return alert('Chọn một phòng để xoá')
    if (window.confirm(`Xoá phòng "${selected.name}"?`)) remove(selected.id)
  }

  return (
    <div className="space-y-4">
      <div className="text-xl font-bold">Quản lý phòng & ghế</div>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={handleAdd}>Thêm</button>
        <button className="btn-outline" onClick={handleEdit}>Sửa</button>
        <button className="btn-outline" onClick={handleDelete}>Xóa</button>
      </div>
      <DataTable
        rows={rows}
        columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Phòng' }]}
        onRowClick={(r: any) => setSelected(r)}
      />
    </div>
  )
}
