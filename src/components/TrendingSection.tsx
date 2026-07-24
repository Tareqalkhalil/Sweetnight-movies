"use client"

import MovieCard from "./MovieCard"
import type { Movie, Series } from "@/types"

interface TrendingSectionProps {
  trendingMovies: Movie[]
  trendingSeries: Series[]
}

export default function TrendingSection({ trendingMovies }: TrendingSectionProps) {
  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto bg-gradient-to-b from-night-800/30 to-night-900">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {trendingMovies.map((movie) => <MovieCard key={movie.id} movie={movie as Movie} />)}
      </div>
    </section>
  )
}
