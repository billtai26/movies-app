import React from "react"
import { MoreVertical } from "lucide-react"
import { api } from "../../lib/api"
import { useAuth } from "../../store/auth"
import { toast } from "react-toastify"

export default function CommentsSection({ movieId }: { movieId: string }){
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [content, setContent] = React.useState("")
  const { name, token, userId } = useAuth()
  const meName = (name || "").toLowerCase()
  
  // State quản lý menu 3 chấm
  const [menuId, setMenuId] = React.useState<string | null>(null)
  
  // State quản lý việc sửa inline
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editContent, setEditContent] = React.useState("")

  // State quản lý xác nhận xóa (tránh dùng window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null)

  const PAGE_SIZE = 5
  const [page, setPage] = React.useState(1)

  // --- Hàm Helper: Lấy thông báo lỗi từ response ---
  const getErrorMessage = (error: any) => {
    // Ưu tiên các trường lỗi thường gặp từ backend
    if (typeof error === 'string') return error;
    if (error?.response?.data?.errors) return error.response.data.errors;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.errors) return error.errors;
    if (error?.message) return error.message;
    return "Có lỗi xảy ra, vui lòng thử lại.";
  }

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
    }).catch((e)=>{ 
        // Lỗi lúc load ban đầu thì log ra console, không cần toast làm phiền user
        console.error(e)
        setItems([]) 
    }).finally(()=>setLoading(false))
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
    
    // Thay alert bằng toast
    if (!token){ 
      toast.warning("Vui lòng đăng nhập để bình luận")
      return 
    }

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
      setContent("")
      toast.success("Đã gửi bình luận!")
    }catch(error: any){
      // Hiển thị lỗi bằng toast thay vì alert/log
      toast.error(getErrorMessage(error))
    }
  }

  const handleDelete = async (id:string) => {
    if (!token){ 
      toast.warning("Vui lòng đăng nhập")
      return 
    }
    
    // Logic confirm đã chuyển vào UI của nút bấm, không dùng window.confirm ở đây nữa
    try{
      await api.remove("comments", id)
      setItems(prev=> prev.filter(c=> (c._id || c.id) !== id))
      toast.success("Đã xóa bình luận")
    }catch(error: any){
      toast.error(getErrorMessage(error))
    }
  }

  // Hàm bắt đầu sửa
  const handleStartEdit = (c: any) => {
    setEditingId(c._id || c.id);
    setEditContent(c.content);
    setMenuId(null); 
    setConfirmDeleteId(null); // Reset trạng thái xóa nếu đang mở
  }

  // Hàm hủy sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  }

  // Hàm lưu sửa đổi
  const handleSaveEdit = async (id:string) => {
    if (!token){ 
      toast.warning("Vui lòng đăng nhập")
      return 
    }
    if (!editContent.trim()) {
        toast.warning("Nội dung không được để trống")
        return
    }; 

    try{
      const updated = await api.update("comments", id, { content: editContent })
      setItems(prev=> prev.map(c=> (c._id||c.id)===id ? { ...c, content: (updated as any)?.content ?? editContent } : c))
      setEditingId(null);
      setEditContent("");
      toast.success("Cập nhật thành công")
    }catch(e: any){
      toast.error(getErrorMessage(e))
    }
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2">
        <span className="inline-block w-[2px] h-5 bg-blue-600"></span>
        <h3 className="text-lg font-semibold">Bình Luận</h3>
      </div>
      
      {/* Form nhập bình luận mới */}
      <div className="space-y-3">
        <textarea 
            value={content} 
            onChange={e=>setContent(e.target.value)} 
            placeholder="Viết bình luận..." 
            className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#f58a1f]" 
            rows={3} 
        />
        <div className="flex justify-end">
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-[#f58a1f] text-white rounded-md text-sm font-medium hover:opacity-90"
          >
            Gửi bình luận
          </button>
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
            const isEditing = editingId === cid; 

            return (
              <div key={cid} className="p-3 border rounded-md bg-white relative">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-semibold text-gray-800">{c.author || "Ẩn danh"}</div>
                  
                  {/* Menu 3 chấm */}
                  {mine && !isEditing && (
                    <div className="relative">
                      <button 
                        onClick={()=>{ 
                            setMenuId(m=> m===cid ? null : cid);
                            setConfirmDeleteId(null); // Reset confirm khi mở lại menu
                        }} 
                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {menuId===cid && (
                        <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-lg z-10 py-1">
                          <button 
                            onClick={() => handleStartEdit(c)} 
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                          >
                            Sửa
                          </button>
                          
                          {/* Logic Xóa 2 bước để tránh confirm browser */}
                          {confirmDeleteId === cid ? (
                              <button 
                                onClick={()=>{ handleDelete(cid); setMenuId(null); }} 
                                className="block w-full text-left px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700 font-medium animate-pulse"
                              >
                                Xác nhận xóa?
                              </button>
                          ) : (
                              <button 
                                onClick={(e)=>{ 
                                    e.stopPropagation();
                                    setConfirmDeleteId(cid); 
                                }} 
                                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                              >
                                Xóa
                              </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Form sửa inline */}
                {isEditing ? (
                    <div className="mt-2 space-y-2">
                        <textarea 
                            autoFocus
                            value={editContent} 
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full border rounded p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            rows={2}
                        />
                        <div className="flex gap-2 justify-end">
                            <button 
                                onClick={handleCancelEdit}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={() => handleSaveEdit(cid)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
                        {c.content}
                    </div>
                )}

              </div>
            )
          })}
          
          {/* Phân trang */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">Trang {page}/{totalPages}</div>
            <div className="flex gap-2">
              <button 
                disabled={page<=1} 
                onClick={()=> setPage(p=> Math.max(1, p-1))} 
                className={`px-2 py-1 border rounded text-xs transition-colors ${page<=1 ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 hover:border-gray-300'}`}
              >
                Trước
              </button>
              <button 
                disabled={page>=totalPages} 
                onClick={()=> setPage(p=> Math.min(totalPages, p+1))} 
                className={`px-2 py-1 border rounded text-xs transition-colors ${page>=totalPages ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 hover:border-gray-300'}`}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
