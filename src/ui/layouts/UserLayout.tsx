
import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
export default function UserLayout(){
  return (
    <div>
      <NavBar/>
      <main className="container-responsive mx-auto max-w-7xl p-3 sm:p-4 md:p-6">
        <Outlet/>
      </main>
      <Footer/>
    </div>
  )
}
