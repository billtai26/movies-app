import React, { useMemo, useState } from 'react'
import { useLocalStorageCRUD } from '../../../store/useLocalStorageCRUD'
import { seedMockOnce } from '../../../store/seedMock'

type StaffReport = {
  id: string
  staff: string
  message: string
  status: 'Chưa duyệt' | 'Đã duyệt' | 'Từ chối'
  createdAt?: string
}

export default function AdminStaffReports() {
  seedMockOnce()
  const { data, addItem, updateItem, deleteItem } =
    useLocalStorageCRUD<StaffReport>('admin_staff_reports', [])
  const [query, setQuery] = useState('')
  const [form, setForm] = useState<Partial<StaffReport>>({
    staff: '',
    message: '',
    status: 'Chưa duyệt',
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  // 🔍 Lọc dữ liệu theo tìm kiếm
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter((r) =>
      (r.staff + ' ' + r.message + ' ' + r.status)
        .toLowerCase()
        .includes(q)
    )
  }, [query, data])

  // 📝 Thêm / Cập nhật
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.staff?.trim() || !form.message?.trim()) return
    if (editingId) {
      updateItem(editingId, {
        staff: form.staff,
        message: form.message,
        status: (form.status as any) ?? 'Chưa duyệt',
      })
      setEditingId(null)
    } else {
      const now = new Date().toISOString()
      addItem({
        id: Date.now().toString(),
        staff: form.staff!.trim(),
        message: form.message!.trim(),
        status: (form.status as any) ?? 'Chưa duyệt',
        createdAt: now,
      } as StaffReport)
    }
    setForm({ staff: '', message: '', status: 'Chưa duyệt' })
  }

  // ✏️ Sửa
  const startEdit = (r: StaffReport) => {
    setEditingId(r.id)
    setForm(r)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Quản lý báo cáo từ nhân viên
        </h1>
        <input
          className="input max-w-xs"
          placeholder="Tìm báo cáo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Form thêm / sửa */}
      <form onSubmit={submit} className="card space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="label">Nhân viên</label>
            <input
              className="input"
              value={form.staff ?? ''}
              onChange={(e) =>
                setForm((s) => ({ ...s, staff: e.target.value }))
              }
              placeholder="Tên nhân viên"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Nội dung</label>
            <input
              className="input"
              value={form.message ?? ''}
              onChange={(e) =>
                setForm((s) => ({ ...s, message: e.target.value }))
              }
              placeholder="Mô tả báo cáo"
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <label className="label m-0">Trạng thái</label>
          <select
            className="input max-w-[180px]"
            value={form.status ?? 'Chưa duyệt'}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                status: e.target.value as any,
              }))
            }
          >
            <option>Chưa duyệt</option>
            <option>Đã duyệt</option>
            <option>Từ chối</option>
          </select>
          <button className="btn-primary" type="submit">
            {editingId ? 'Cập nhật' : 'Thêm'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setEditingId(null)
                setForm({
                  staff: '',
                  message: '',
                  status: 'Chưa duyệt',
                })
              }}
            >
              Huỷ
            </button>
          )}
        </div>
      </form>

      {/* Bảng dữ liệu */}
      <div className="card table-wrap">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">#</th>
                <th className="p-2">Nhân viên</th>
                <th className="p-2">Nội dung</th>
                <th className="p-2">Trạng thái</th>
                <th className="p-2">Thời gian</th>
                <th className="p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{r.staff}</td>
                  <td className="p-2">{r.message}</td>
                  <td className="p-2">
                    <span
                      className={`chip ${
                        r.status === 'Đã duyệt'
                          ? 'bg-green-200 text-green-800'
                          : r.status === 'Từ chối'
                          ? 'bg-red-200 text-red-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : ''}
                  </td>
                  <td className="p-2 flex gap-2 flex-wrap">
                    <button
                      className="btn-outline"
                      onClick={() => startEdit(r)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn-outline"
                      onClick={() =>
                        updateItem(r.id, { status: 'Đã duyệt' })
                      }
                    >
                      Duyệt
                    </button>
                    <button
                      className="btn-outline"
                      onClick={() =>
                        updateItem(r.id, { status: 'Từ chối' })
                      }
                    >
                      Từ chối
                    </button>
                    <button
                      className="btn-outline text-red-500"
                      onClick={() => deleteItem(r.id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    className="p-4 italic text-gray-500"
                    colSpan={6}
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
