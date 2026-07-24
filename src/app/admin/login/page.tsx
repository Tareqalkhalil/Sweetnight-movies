"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, ShieldCheck } from "lucide-react"
import { createAdminCookieValueSync, getAdminCookieName } from "@/lib/admin-auth"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ""

    if (!expectedPassword) {
      setError("Access is temporarily unavailable")
      return
    }

    if (password === expectedPassword) {
      const cookieValue = createAdminCookieValueSync()
      document.cookie = `${getAdminCookieName()}=${cookieValue}; path=/; max-age=86400; SameSite=Lax`
      router.push("/admin")
      router.refresh()
    } else {
      setError("Invalid credentials")
    }
  }

  return (
    <main className="min-h-screen bg-night-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-night-800/80 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sweet-coral to-sweet-gold text-2xl">
            <ShieldCheck className="h-7 w-7 text-night-900" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Access</h1>
          <p className="mt-2 text-sm text-gray-400">Only authorized admins can open this area.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-night-900 px-4 py-3 pr-12 text-white outline-none"
                placeholder="Enter admin password"
              />
            </div>
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button className="w-full rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold px-4 py-3 font-bold text-night-900">
            Enter Admin Panel
          </button>
        </form>
      </div>
    </main>
  )
}
