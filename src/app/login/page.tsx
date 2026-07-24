"use client"

import { useState } from "react"
import Link from "next/link"
import { Moon, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const locale = getLocaleFromCookie()
  const t = getDictionary(locale).pages.login

  return (
    <main className="min-h-screen bg-night-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sweet-coral to-sweet-gold flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-sweet-coral/20">
            🌙
          </div>
          <h1 className="text-2xl font-black text-white">
            Sweet Night
          </h1>
          <p className="text-gray-400 text-sm mt-2">{t.title}</p>
        </div>

        {/* Form */}
        <div className="bg-night-800 rounded-3xl p-8 border border-white/5 shadow-2xl">
          <form className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">{t.email}</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-night-900 border border-white/10 rounded-xl pr-12 pl-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-sweet-gold/50 focus:ring-1 focus:ring-sweet-gold/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">{t.password}</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-night-900 border border-white/10 rounded-xl pr-12 pl-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-sweet-gold/50 focus:ring-1 focus:ring-sweet-gold/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input type="checkbox" className="rounded bg-night-900 border-white/20 text-sweet-gold focus:ring-sweet-gold" />
                {t.rememberMe}
              </label>
              <Link href="/forgot-password" className="text-sweet-gold hover:underline">
                {t.forgotPassword}
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 font-extrabold text-base hover:shadow-lg hover:shadow-sweet-coral/30 transition-all hover:scale-[1.02]"
            >
              {t.submit}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {t.noAccount}{" "}
              <Link href="/register" className="text-sweet-gold font-bold hover:underline">
                {t.createAccount}
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-night-800/50 rounded-xl p-4 border border-white/5 text-center">
          <p className="text-gray-500 text-xs mb-2">{t.demo}</p>
          <p className="text-gray-400 text-xs">{t.admin} استخدم بيانات الحساب المخصصة لديك</p>
          <p className="text-gray-400 text-xs">{t.user} user@sweetnight.com / user123</p>
        </div>
      </div>
    </main>
  )
}
