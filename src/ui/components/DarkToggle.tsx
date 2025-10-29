
import React from 'react'
import { useTheme } from '../../store/theme'
export default function DarkToggle(){
  const { dark, toggle, init } = useTheme()
  React.useEffect(()=>{ init() }, [])
  return (
    <button title="Toggle dark mode" onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
      {dark ? '🌙' : '☀️'}
    </button>
  )
}
