
import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
export default function UserLayout(){
  return (
    <div>
      <NavBar/>
      <main className="mx-auto max-w-7xl p-4">
        <Outlet/>
      </main>
      <Footer/>
    </div>
  )
}
