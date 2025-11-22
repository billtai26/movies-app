import React, { useMemo, useState } from 'react'


type CommentItem = {
  id: string
  user?: string
  movie?: string
  content: string
  createdAt?: string
  status?: 'visible' | 'hidden'
}

export default function StaffComments() {

  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý bình luận (Staff)</h1>
        <input className="input max-w-xs" placeholder="Tìm bình luận..." value={query} onChange={e=>setQuery(e.target.value)} />
      </div>

      <form onSubmit={submit} className="card space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="label">Người dùng</label>
            <input className="input" value={form.user ?? ''} onChange={e=>setForm(s=>({...s, user:e.target.value}))} placeholder="Tên người dùng"/>
          </div>
          <div>
            <label className="label">Phim</label>
            <input className="input" value={form.movie ?? ''} onChange={e=>setForm(s=>({...s, movie:e.target.value}))} placeholder="Tên phim"/>
          </div>
          <div>
            <label className="label">Trạng thái</label>
            <select className="input" value={form.status ?? 'visible'} onChange={e=>setForm(s=>({...s, status: e.target.value as any}))}>
              <option value="visible">Hiển thị</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Nội dung bình luận</label>
          <textarea className="input" value={form.content ?? ''} onChange={e=>setForm(s=>({...s, content:e.target.value}))} placeholder="Nhập nội dung..."/>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" type="submit">{editingId ? 'Cập nhật' : 'Thêm'}</button>
          {editingId && (
            <button type="button" className="btn-outline" onClick={()=>{ setEditingId(null); setForm({ content:'', status:'visible' })}}>Huỷ</button>
          )}
        </div>
      </form>

      <div className="card table-wrap">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">#</th>
                <th className="p-2">Người dùng</th>
                <th className="p-2">Phim</th>
                <th className="p-2">Nội dung</th>
                <th className="p-2">Trạng thái</th>
                <th className="p-2">Thời gian</th>
                <th className="p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{idx+1}</td>
                  <td className="p-2">{c.user}</td>
                  <td className="p-2">{c.movie}</td>
                  <td className="p-2">{c.content}</td>
                  <td className="p-2"><span className={'chip ' + (c.status==='visible'?'chip-brand':'')}>{c.status}</span></td>
                  <td className="p-2">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</td>
                  <td className="p-2 flex gap-2">
                    <button className="btn-outline" onClick={()=>startEdit(c)}>Sửa</button>
                    <button className="btn-outline text-red-500" onClick={()=>deleteItem(c.id)}>Xoá</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="p-4 italic text-gray-500" colSpan={7}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}