
import { create } from 'zustand'
type ThemeState = { dark:boolean; init:()=>void; toggle:()=>void; set:(v:boolean)=>void }
export const useTheme = create<ThemeState>((set)=>({
  dark: true,
  init: ()=>set((s)=>{
    const prefer = (typeof localStorage!=='undefined' && localStorage.theme)? localStorage.theme==='dark' : true
    if (typeof document!=='undefined') document.documentElement.classList.toggle('dark', prefer)
    return { dark: prefer }
  }),
  toggle: ()=>set((s)=>{
    const d = !s.dark
    if (typeof document!=='undefined') document.documentElement.classList.toggle('dark', d)
    if (typeof localStorage!=='undefined') localStorage.theme = d ? 'dark' : 'light'
    return { dark: d }
  }),
  set: (v)=>set(()=>{
    if (typeof document!=='undefined') document.documentElement.classList.toggle('dark', v)
    if (typeof localStorage!=='undefined') localStorage.theme = v ? 'dark' : 'light'
    return { dark: v }
  })
}))
