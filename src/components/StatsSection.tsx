"use client"

import { useEffect, useState } from "react"
import { Film, Tv, Users, Award } from "lucide-react"
import { getClientLocale, getDictionary } from "@/lib/i18n"

const stats = [
  { icon: <Film className="w-8 h-8" />, value: 15000, suffix: "+", labelAr: "فيلم ومسلسل", labelEn: "Movie & Series", color: "#feca57" },
  { icon: <Award className="w-8 h-8" />, value: 4, suffix: "K", labelAr: "جودة فائقة", labelEn: "Premium Quality", color: "#ff6b6b" },
  { icon: <Tv className="w-8 h-8" />, value: 40, suffix: "+", labelAr: "قسم متنوع", labelEn: "Diverse Categories", color: "#a29bfe" },
  { icon: <Users className="w-8 h-8" />, value: 2, suffix: "M+", labelAr: "مستخدم نشط", labelEn: "Active Users", color: "#00cec9" },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function StatsSection() {
  const locale = getClientLocale()

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center hover:bg-white/[0.05] transition-all hover:-translate-y-1"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="text-3xl font-black text-white mb-1">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-sm text-gray-400">{locale === "en" ? stat.labelEn : stat.labelAr}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
