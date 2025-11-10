
import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
export default function UserLayout(){
  return (
    <div>
      <NavBar/>
      <main className="container-responsive mx-auto max-w-7xl px-3 sm:px-4 md:px-6 pt-0 pb-6">
        <Outlet/>
      </main>
      <Footer/>
    </div>
  )
}
