import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      // Fake success (sau này thay bằng API thật)
      const newUser = { email, password }
      localStorage.setItem("user", JSON.stringify(newUser))
      navigate("/login")
    } catch (err) {
      console.error(err)
      setError("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[80vh] flex items-center justify-center bg-neutral-950 text-white px-4">
        <div className="bg-neutral-900 rounded-2xl p-8 w-full max-w-md shadow-xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
          {error && <p className="text-rose-500 mb-4 text-sm text-center">{error}</p>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full bg-neutral-800 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-rose-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                className="w-full bg-neutral-800 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-rose-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full bg-neutral-800 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-rose-600"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 transition font-semibold"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-neutral-400">
            Already have an account?{" "}
            <Link to="/login" className="text-rose-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
