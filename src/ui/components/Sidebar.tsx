import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ items }: { items:{to:string; label:string; icon?:React.ReactNode}[] }) {
  return (
    <div className="flex h-full flex-col border-r bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
      <div className="mb-4 text-xl font-bold text-brand dark:text-orange-400">Only Cinema Panel</div>
      <nav className="space-y-1 flex-1">
        {items.map(i=>(
          <NavLink key={i.to} to={i.to}
            className={({isActive})=>`
              flex items-center gap-2 rounded-xl px-3 py-2 transition-colors
              ${isActive ? 'bg-brand text-white dark:bg-orange-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
            `}
          >
            <span className="text-gray-500 dark:text-gray-400">{i.icon}</span>
            <span>{i.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
