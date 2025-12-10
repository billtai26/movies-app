import { useEffect, useState, useRef } from "react"

// 👇 SỬA 1: Định nghĩa lại WithId đơn giản hơn để TS hiểu đây là Object
export interface BaseItem {
  id: string | number
  [key: string]: any // Cho phép chứa các trường khác
}

// 👇 SỬA 2: Ràng buộc T phải extend BaseItem (đảm bảo là Object và có id)
export function useLocalStorageCRUD<T extends BaseItem>(
  key: string,
  initial: T[] = []
) {
  // 🧠 FIX 1: Dùng Lazy Initialization
  const [data, setData] = useState<T[]>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        return JSON.parse(raw)
      }
      localStorage.setItem(key, JSON.stringify(initial))
      return initial
    } catch (err) {
      console.error("⚠️ Lỗi đọc localStorage:", err)
      return initial
    }
  })

  const isMounted = useRef(false)

  // 💾 Ghi dữ liệu mỗi khi thay đổi
  useEffect(() => {
    // Bỏ qua lần render đầu tiên để tránh ghi đè nếu muốn strict, 
    // nhưng với lazy init ở trên thì không quá lo.
    // Nếu muốn an toàn tuyệt đối với React 18 strict mode:
    if (!isMounted.current) {
        isMounted.current = true;
        return;
    }
    
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (err) {
      console.error("⚠️ Lỗi ghi localStorage:", err)
    }
  }, [key, data])

  // 🧩 CRUD methods

  // 👇 SỬA 3: Định nghĩa item đầu vào rõ ràng hơn
  const addItem = (item: Omit<T, 'id'> & { id?: string | number }) => {
    const id = item.id ?? Date.now().toString()
    // Ép kiểu (item as T) hoặc để TS tự suy diễn object spread
    const newItem = { ...item, id } as T
    setData((prev) => [...prev, newItem])
  }

  const updateItem = (id: string | number, patch: Partial<T>) => {
    setData((prev) =>
      prev.map((it) => {
        // 🧠 FIX 2: Ép kiểu String
        if (String(it.id) === String(id)) {
          // 👇 SỬA 4: Spread object an toàn
          return { ...it, ...patch }
        }
        return it
      })
    )
  }

  const deleteItem = (id: string | number) => {
    setData((prev) => 
      prev.filter((it) => String(it.id) !== String(id))
    )
  }

  const replaceItem = (id: string | number, next: T) => {
    setData((prev) => 
      prev.map((it) => (String(it.id) === String(id) ? next : it))
    )
  }

  const setAll = (next: T[]) => setData(next)

  return { data, addItem, updateItem, deleteItem, replaceItem, setAll }
}