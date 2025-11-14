import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function UserLayout() {
  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen flex flex-col">
      {/* Header */}
      <NavBar />

      {/* Main content */}
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-4">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
