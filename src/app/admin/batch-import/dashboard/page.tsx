"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, CheckCircle2, AlertCircle, Clock, Activity } from "lucide-react"
import { BatchImportComponent } from "@/components/BatchImportComponent"

interface ImportLog {
  id: string
  timestamp: string
  contentType: "movie" | "series" | "anime"
  categorySlug: string
  count: number
  titles: string[]
}

export default function BatchImportDashboard() {
  const [logs, setLogs] = useState<ImportLog[]>([])
  const [stats, setStats] = useState({
    totalImported: 0,
    totalTitles: 0,
    lastImportTime: null as string | null,
  })

  // Load logs from localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem("batch_import_logs") || "[]"
    try {
      const parsedLogs = JSON.parse(savedLogs)
      setLogs(parsedLogs)

      // Calculate stats
      const totalImported = parsedLogs.reduce((sum: number, log: ImportLog) => sum + log.count, 0)
      const totalTitles = parsedLogs.reduce((sum: number, log: ImportLog) => sum + (log.titles?.length || 0), 0)
      const lastImportTime = parsedLogs[0]?.timestamp || null

      setStats({
        totalImported,
        totalTitles,
        lastImportTime,
      })
    } catch (err) {
      console.error("Error loading logs:", err)
    }
  }, [])

  const handleImportSuccess = (result: any) => {
    const newLog: ImportLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString("ar-SA"),
      contentType: "movie", // Should come from component state
      categorySlug: "", // Should come from component state
      count: result.count,
      titles: result.items.map((item: any) => item.title),
    }

    const updatedLogs = [newLog, ...logs].slice(0, 50) // Keep last 50
    setLogs(updatedLogs)
    localStorage.setItem("batch_import_logs", JSON.stringify(updatedLogs))

    // Update stats
    setStats((prev) => ({
      totalImported: prev.totalImported + result.count,
      totalTitles: prev.totalTitles + result.items.length,
      lastImportTime: newLog.timestamp,
    }))
  }

  const clearLogs = () => {
    if (confirm("هل أنت متأكد من حذف جميع السجلات؟")) {
      setLogs([])
      localStorage.removeItem("batch_import_logs")
      setStats({
        totalImported: 0,
        totalTitles: 0,
        lastImportTime: null,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            لوحة تحكم الاستيراد الجماعي
          </h1>
          <p className="text-slate-400">
            إدارة واستيراد محتوى متعدد من TopCinema
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Imported */}
          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/10 border border-cyan-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">إجمالي المستوردة</p>
                <p className="text-3xl font-bold text-cyan-400">{stats.totalImported}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </div>

          {/* Total Titles */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">إجمالي الأسماء</p>
                <p className="text-3xl font-bold text-blue-400">{stats.totalTitles}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </div>

          {/* Last Import */}
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">آخر استيراد</p>
                <p className="text-sm font-mono text-green-400">
                  {stats.lastImportTime || "لم يتم"}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">معدل النجاح</p>
                <p className="text-3xl font-bold text-purple-400">
                  {stats.totalTitles > 0 ? "100%" : "0%"}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Import Form */}
          <div className="lg:col-span-2 bg-slate-700/50 border border-slate-600 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">استيراد جديد</h2>
            <BatchImportComponent
              onImportSuccess={handleImportSuccess}
            />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Top Content Types */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">إحصائيات سريعة</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">🎬 أفلام</span>
                  <span className="font-bold text-cyan-400">
                    {logs.filter((l) => l.contentType === "movie").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">📺 مسلسلات</span>
                  <span className="font-bold text-cyan-400">
                    {logs.filter((l) => l.contentType === "series").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">⛩️ أنمي</span>
                  <span className="font-bold text-cyan-400">
                    {logs.filter((l) => l.contentType === "anime").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-500 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-300 mb-4">💡 نصائح</h3>
              <ul className="text-sm text-blue-100 space-y-2">
                <li>✅ استخدم اسماً واضحاً لكل عنصر</li>
                <li>✅ يمكنك لصق قائمة كاملة من الحافظة</li>
                <li>✅ تحقق من الفئة قبل الاستيراد</li>
                <li>✅ سيتم حفظ السجلات تلقائياً</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Imports */}
        {logs.length > 0 && (
          <div className="mt-8 bg-slate-700/50 border border-slate-600 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">السجلات الأخيرة</h2>
              <button
                onClick={clearLogs}
                className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
              >
                حذف الكل
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-800 p-4 rounded-lg flex items-start justify-between hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {log.contentType === "movie"
                          ? "🎬"
                          : log.contentType === "series"
                          ? "📺"
                          : "⛩️"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {log.count} عنصر
                        </p>
                        <p className="text-xs text-slate-400">{log.timestamp}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 truncate">
                      {log.titles?.slice(0, 3).join(" • ") || "بدون أسماء"}
                      {log.titles && log.titles.length > 3 && " ..."}
                    </p>
                  </div>
                  <div className="ml-4 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold flex-shrink-0">
                    ✅ تم
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {logs.length === 0 && (
          <div className="mt-8 bg-slate-700/50 border border-slate-600 rounded-xl p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400 text-lg">لا توجد سجلات استيراد حتى الآن</p>
            <p className="text-slate-500 text-sm mt-2">ابدأ باستيراد المحتوى الآن!</p>
          </div>
        )}
      </div>
    </div>
  )
}
