import { useEffect, useState } from 'react'

export type WithId<T = any> = T & { id: string | number }

/**
 * Generic CRUD state persisted to localStorage.
 * Each item must have an "id" field (string or number).
 */
export function useLocalStorageCRUD<T extends WithId>(key: string, initial: T[] = []) {
  const [data, setData] = useState<T[]>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T[]) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
  }, [key, data])

  const addItem = (item: Omit<T, 'id'> & Partial<Pick<T, 'id'>>) => {
    const id = (item as any).id ?? Date.now().toString()
    setData(prev => [...prev, { ...(item as any), id }])
  }

  const updateItem = (id: string | number, patch: Partial<T>) => {
    setData(prev => prev.map((it: any) => (it.id === id ? { ...it, ...patch } : it)))
  }

  const replaceItem = (id: string | number, next: T) => {
    setData(prev => prev.map((it: any) => (it.id === id ? next : it)))
  }

  const deleteItem = (id: string | number) => {
    setData(prev => prev.filter((it: any) => it.id !== id))
  }

  const setAll = (next: T[]) => setData(next)

  return { data, addItem, updateItem, replaceItem, deleteItem, setAll }
}