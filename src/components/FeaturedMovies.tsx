"use client"

import MovieCard from "./MovieCard"
import type { Movie } from "@/types"

interface FeaturedMoviesProps {
  movies: Movie[]
}

export default function FeaturedMovies({ movies }: FeaturedMoviesProps) {
  const blockedTerms = [/harry potter/i, /potter/i, /هاري بوتر/i, /بوتر/i]

  const visibleMovies = movies
    .filter((movie) => {
      const title = `${movie.title || ""} ${movie.titleAr || ""}`.trim()
      return !blockedTerms.some((term) => term.test(title))
    })
    .filter((movie, index, array) => array.findIndex((item) => item.id === movie.id) === index)
    .slice(0, 5)

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto bg-gradient-to-b from-night-900 to-night-800/30">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-white">أفلام Netflix</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {visibleMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  )
}
