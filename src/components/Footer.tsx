"use client"

import Link from "next/link"
import { Moon, Mail, MessageCircle, Smartphone, Twitter } from "lucide-react"
import { getClientLocale, getDictionary } from "@/lib/i18n"

export default function Footer() {
  const locale = getClientLocale()
  const t = getDictionary(locale).footer

  const footerLinks = {
    categories: [
      { label: t.links.actionMovies, href: "/categories/action" },
      { label: t.links.dramaSeries, href: "/categories/drama-series" },
      { label: t.links.comedyMovies, href: "/categories/comedy" },
      { label: t.links.horrorMovies, href: "/categories/horror" },
      { label: t.links.anime, href: "/anime" },
      { label: "Admin", href: "/admin" },
    ],
    support: [
      { label: t.links.helpCenter, href: "/help" },
      { label: t.links.faq, href: "/faq" },
      { label: t.links.terms, href: "/terms" },
      { label: t.links.privacy, href: "/privacy" },
    ],
  }

  return (
    <footer className="bg-night-900 border-t border-white/5 pt-16 pb-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sweet-coral to-sweet-gold flex items-center justify-center text-lg">
                🌙
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-sweet-gold to-sweet-coral bg-clip-text text-transparent">
                Sweet Night
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t.description}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">{t.categoriesTitle}</h4>
            <div className="flex flex-col gap-2.5">
              {footerLinks.categories.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 text-sm hover:text-sweet-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">{t.supportTitle}</h4>
            <div className="flex flex-col gap-2.5">
              {footerLinks.support.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 text-sm hover:text-sweet-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">{t.contactTitle}</h4>
            <div className="flex gap-3">
              {[
                { icon: <Smartphone className="w-5 h-5" />, label: "Phone" },
                { icon: <MessageCircle className="w-5 h-5" />, label: "Chat" },
                { icon: <Mail className="w-5 h-5" />, label: "Email" },
                { icon: <Twitter className="w-5 h-5" />, label: "Twitter" },
              ].map((social) => (
                <button
                  key={social.label}
                  className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-sweet-gold hover:border-sweet-gold/30 transition-all"
                  aria-label={social.label}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Sweet Night. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
