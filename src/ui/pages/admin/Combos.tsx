import React from 'react'
import DataTable from '../../components/DataTable'
import { useCollection } from '../../../lib/mockCrud'
import { seedAll } from '../../../lib/seed'

export default function Combos() {
  const { rows, create, update, remove } = useCollection<any>('combos')
  const [selected, setSelected] = React.useState<any | null>(null)

  React.useEffect(() => {
    seedAll()
  }, [])

  const handleAdd = () => {
    const name = prompt('Tên combo:')
    const price = prompt('Giá combo:')
    const desc = prompt('Mô tả combo:')
    if (name && price)
      create({ name, price: Number(price), desc: desc || '' })
  }

  const handleEdit = () => {
    if (!selected) return alert('Chọn một combo để sửa')
    const name = prompt('Tên combo mới:', selected.name)
    const price = prompt('Giá combo mới:', selected.price)
    const desc = prompt('Mô tả combo:', selected.desc)
    if (name && price)
      update(selected.id, { name, price: Number(price), desc: desc || '' })
  }

  const handleDelete = () => {
    if (!selected) return alert('Chọn một combo để xoá')
    if (window.confirm(`Xoá combo "${selected.name}"?`)) remove(selected.id)
  }

  return (
    <div className="space-y-4">
      <div className="text-xl font-bold">Quản lý combo đồ ăn</div>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={handleAdd}>Thêm</button>
        <button className="btn-outline" onClick={handleEdit}>Sửa</button>
        <button className="btn-outline" onClick={handleDelete}>Xóa</button>
      </div>
      <DataTable
        rows={rows}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Tên combo' },
          { key: 'price', label: 'Giá' },
          { key: 'desc', label: 'Mô tả' },
        ]}
        onRowClick={(r: any) => setSelected(r)}
        selectedRow={selected}
      />
    </div>
  )
}
