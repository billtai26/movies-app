import React from "react"
import { MoreVertical } from "lucide-react"
import { api } from "../../lib/api"
import { useAuth } from "../../store/auth"

export default function CommentsSection({ movieId }: { movieId: string }){
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [content, setContent] = React.useState("")
  const { name, email, token, userId } = useAuth()
  const meName = (name || "").toLowerCase()
  const [menuId, setMenuId] = React.useState<string | null>(null)
  const PAGE_SIZE = 5
  const [page, setPage] = React.useState(1)

  const getObjIdTime = (id: any) => {
    const s = String(id || "")
    if (s.length >= 8) {
      const hex = s.slice(0, 8)
      const ts = parseInt(hex, 16)
      if (!Number.isNaN(ts)) return ts * 1000
    }
    return 0
  }

  React.useEffect(()=>{
    setLoading(true)
    api.listComments(movieId).then((res:any)=>{
      const arrRaw = Array.isArray(res?.comments) ? res.comments : (Array.isArray(res) ? res : [])
      const arr = arrRaw.map((c:any)=>({
        ...c,
        author: c?.user?.username || c?.user?.name || c?.name || c?.author || 'Ẩn danh'
      }))
      setItems(arr)
    }).catch(()=>{ setItems([]) }).finally(()=>setLoading(false))
  },[movieId])

  React.useEffect(()=>{
    const total = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
    if (page > total) setPage(total)
    if (page < 1) setPage(1)
  },[items, page])

  const sorted = React.useMemo(()=>{
    const a = [...items]
    a.sort((x:any, y:any)=>{
      const tx = new Date(x?.createdAt || x?.updatedAt || 0).getTime() || getObjIdTime(x?._id || x?.id)
      const ty = new Date(y?.createdAt || y?.updatedAt || 0).getTime() || getObjIdTime(y?._id || y?.id)
      return ty - tx
    })
    return a
  },[items])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const visible = sorted.slice(start, start + PAGE_SIZE)

  const handleSubmit = async () => {
    if (!content.trim()) return
    const author = name || "Người dùng"
    if (!token){ alert("Vui lòng đăng nhập để bình luận"); return }
    try{
      const created:any = await api.create("comments", { movieId, content })
      const cid = created?._id || created?.id || `${Date.now()}`
      setItems(prev=>[
        {
          _id: cid,
          movieId,
          content: created?.content ?? content,
          author: created?.user?.name ?? created?.user?.username ?? created?.name ?? created?.author ?? author,
          userId: created?.userId ?? userId ?? null
        },
        ...prev
      ])
      setPage(1)
    }catch{
      setItems(prev=>prev)
    }
    setContent("")
  }

  const handleDelete = async (id:string) => {
    if (!token){ alert("Vui lòng đăng nhập"); return }
    try{
      await api.remove("comments", id)
      setItems(prev=> prev.filter(c=> (c._id || c.id) !== id))
    }catch{
      setItems(prev=> prev)
    }
  }

  const handleUpdate = async (id:string, nextContent:string) => {
    if (!token){ alert("Vui lòng đăng nhập"); return }
    try{
      const updated = await api.update("comments", id, { content: nextContent })
      setItems(prev=> prev.map(c=> (c._id||c.id)===id ? { ...c, content: (updated as any)?.content ?? nextContent } : c))
    }catch{
      setItems(prev=> prev)
    }
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2">
        <span className="inline-block w-[2px] h-5 bg-blue-600"></span>
        <h3 className="text-lg font-semibold">Bình Luận</h3>
      </div>
      <div className="space-y-3">
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Viết bình luận..." className="w-full border rounded-md p-3 text-sm" rows={3} />
        <div className="flex justify-end">
          <button onClick={handleSubmit} className="px-4 py-2 bg-[#f58a1f] text-white rounded-md text-sm font-medium">Gửi bình luận</button>
        </div>
      </div>
      {loading ? (
        <div className="text-sm text-gray-500">Đang tải bình luận...</div>
      ) : items.length===0 ? (
        <div className="text-sm text-gray-500">Chưa có bình luận nào</div>
      ) : (
        <div className="space-y-3">
          {visible.map((c:any)=> {
            const cid = c._id || c.id
            const mine = (c?.userId && userId ? String(c.userId)===String(userId) : String((c.author || c.user?.name || c.user?.username || "")).toLowerCase() === meName)
            return (
              <div key={cid} className="p-3 border rounded-md bg-white relative">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-semibold">{c.author || "Ẩn danh"}</div>
                  {mine && (
                    <div className="relative">
                      <button onClick={()=> setMenuId(m=> m===cid ? null : cid)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100">
                        <MoreVertical size={16} />
                      </button>
                      {menuId===cid && (
                        <div className="absolute right-0 mt-1 w-28 bg-white border rounded shadow z-10">
                          <button onClick={()=>{ const next = prompt("Sửa bình luận:", c.content); if (next!=null) handleUpdate(cid, next); setMenuId(null); }} className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-50">Sửa</button>
                          <button onClick={()=>{ handleDelete(cid); setMenuId(null); }} className="block w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-gray-50">Xóa</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{c.content}</div>
              </div>
            )
          })}
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-600">Trang {page}/{totalPages}</div>
            <div className="flex gap-2">
              <button disabled={page<=1} onClick={()=> setPage(p=> Math.max(1, p-1))} className={`px-2 py-1 border rounded text-xs ${page<=1 ? 'opacity-50 cursor-not-allowed' : ''}`}>Trước</button>
              <button disabled={page>=totalPages} onClick={()=> setPage(p=> Math.min(totalPages, p+1))} className={`px-2 py-1 border rounded text-xs ${page>=totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}>Sau</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}