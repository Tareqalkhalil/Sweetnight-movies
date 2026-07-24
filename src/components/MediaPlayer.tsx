"use client"

import { PlayCircle } from "lucide-react"

interface MediaPlayerProps {
  title: string
  url?: string | null
  className?: string
}

export default function MediaPlayer({ title, url, className }: MediaPlayerProps) {
  if (!url) return null

  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-white/10 bg-night-800 shadow-2xl shadow-black/20 ${className || ""}`}
      key={normalizedUrl}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <PlayCircle className="h-4 w-4 text-sweet-gold" />
          <span>VidLink Player</span>
        </div>
        <span className="text-xs text-gray-400">{title}</span>
      </div>
      <div className="aspect-video bg-black">
        <iframe
          key={normalizedUrl}
          src={normalizedUrl}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="h-full w-full"
        />
      </div>
    </div>
  )
}
