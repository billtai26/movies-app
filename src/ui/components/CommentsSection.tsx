import React from "react"
import { api } from "../../lib/api"
import { useAuth } from "../../store/auth"

export default function CommentsSection({ movieId }: { movieId: string }){
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [content, setContent] = React.useState("")
  const { name, email, token } = useAuth()
  const me = (name || email || "").toLowerCase()

  React.useEffect(()=>{
    setLoading(true)
    api.listComments(movieId).then((res:any)=>{
      const arr = Array.isArray(res?.comments) ? res.comments : (Array.isArray(res) ? res : [])
      setItems(arr)
    }).catch(()=>{
      try{
        const raw = localStorage.getItem(`comments::${movieId}`)
        setItems(raw ? JSON.parse(raw) : [])
      }catch{ setItems([]) }
    }).finally(()=>setLoading(false))
  },[movieId])

  const handleSubmit = async () => {
    if (!content.trim()) return
    const author = name || email || "Người dùng"
    if (!token){ alert("Vui lòng đăng nhập để bình luận"); return }
    try{
      const created = await api.create("comments", { movieId, content })
      setItems(prev=>[{ ...(created||{ author, content, movieId }), _id: (created as any)?._id }, ...prev])
    }catch{
      const local = { id: `${Date.now()}`, author, content, movieId }
      setItems(prev=>[local, ...prev])
      try{ localStorage.setItem(`comments::${movieId}`, JSON.stringify([local, ...items])) }catch{}
    }
    setContent("")
  }

  const handleDelete = async (id:string) => {
    if (!token){ alert("Vui lòng đăng nhập"); return }
    try{
      await api.remove("comments", id)
      setItems(prev=> prev.filter(c=> (c._id || c.id) !== id))
    }catch{
      setItems(prev=> prev.filter(c=> (c._id || c.id) !== id))
      try{ localStorage.setItem(`comments::${movieId}`, JSON.stringify(items.filter(c=> (c._id||c.id)!==id))) }catch{}
    }
  }

  const handleUpdate = async (id:string, nextContent:string) => {
    if (!token){ alert("Vui lòng đăng nhập"); return }
    try{
      const updated = await api.update("comments", id, { content: nextContent })
      setItems(prev=> prev.map(c=> (c._id||c.id)===id ? { ...c, content: (updated as any)?.content ?? nextContent } : c))
    }catch{
      setItems(prev=> prev.map(c=> (c._id||c.id)===id ? { ...c, content: nextContent } : c))
      try{ localStorage.setItem(`comments::${movieId}`, JSON.stringify(items.map(c=> (c._id||c.id)===id ? { ...c, content: nextContent } : c))) }catch{}
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
          {items.map((c:any)=> {
            const cid = c._id || c.id
            const mine = String(c.author||"").toLowerCase() === me
            return (
              <div key={cid} className="p-3 border rounded-md bg-white">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-semibold">{c.author || "Ẩn danh"}</div>
                  {mine && (
                    <div className="flex gap-2">
                      <button onClick={()=>{
                        const next = prompt("Sửa bình luận:", c.content)
                        if (next!=null) handleUpdate(cid, next)
                      }} className="text-xs px-2 py-1 border rounded">Sửa</button>
                      <button onClick={()=> handleDelete(cid)} className="text-xs px-2 py-1 border rounded text-red-600">Xóa</button>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{c.content}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}