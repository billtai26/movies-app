export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-800">
      <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
        <p>&copy; {new Date().getFullYear()} Cinesta Clone. All rights reserved.</p>
        <nav className="flex items-center gap-4">
          <a className="hover:text-white" href="#">Terms</a>
          <a className="hover:text-white" href="#">Privacy</a>
          <a className="hover:text-white" href="#">Help</a>
        </nav>
      </div>
    </footer>
  )
}
