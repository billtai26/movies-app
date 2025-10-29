import { useEffect, useState } from "react"

export type WithId<T = any> = T & { id: string | number }

/**
 * Hook CRUD an toàn, tự sync localStorage, hỗ trợ seed ban đầu.
 */
export function useLocalStorageCRUD<T extends WithId>(
  key: string,
  initial: T[] = []
) {
  const [data, setData] = useState<T[]>([])

  // 🧠 Load dữ liệu khi mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        setData(JSON.parse(raw))
      } else {
        localStorage.setItem(key, JSON.stringify(initial))
        setData(initial)
      }
    } catch (err) {
      console.error("⚠️ Lỗi đọc localStorage:", err)
      setData(initial)
    }
  }, [key])

  // 💾 Ghi dữ liệu mỗi khi thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (err) {
      console.error("⚠️ Lỗi ghi localStorage:", err)
    }
  }, [key, data])

  // 🧩 CRUD methods
  const addItem = (item: Omit<T, "id"> & Partial<Pick<T, "id">>) => {
    const id = (item as any).id ?? Date.now().toString()
    setData((prev) => [...prev, { ...(item as any), id }])
  }

  const updateItem = (id: string | number, patch: Partial<T>) => {
    setData((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  const deleteItem = (id: string | number) => {
    setData((prev) => prev.filter((it) => it.id !== id))
  }

  const replaceItem = (id: string | number, next: T) => {
    setData((prev) => prev.map((it) => (it.id === id ? next : it)))
  }

  const setAll = (next: T[]) => setData(next)

  return { data, addItem, updateItem, deleteItem, replaceItem, setAll }
}
