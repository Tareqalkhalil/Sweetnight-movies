export interface Movie {
  id: string
  title: string
  titleAr?: string | null
  slug: string
  description: string
  descriptionAr?: string | null
  poster?: string | null
  backdrop?: string | null
  trailer?: string | null
  embedUrl?: string | null
  duration: number
  releaseYear: number
  rating: number
  ageRating?: string | null
  language: string
  quality: string
  views: number
  isFeatured: boolean
  isTrending: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  categories?: { category: Category }[]
  cast?: { person: Person; role: string }[]
  directors?: { person: Person }[]
}

export interface Series {
  id: string
  title: string
  titleAr?: string | null
  slug: string
  description: string
  descriptionAr?: string | null
  poster?: string | null
  backdrop?: string | null
  trailer?: string | null
  embedUrl?: string | null
  totalSeasons: number
  totalEpisodes: number
  releaseYear: number
  endYear?: number | null
  rating: number
  ageRating?: string | null
  language: string
  quality: string
  views: number
  isFeatured: boolean
  isTrending: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  categories?: { category: Category }[]
  cast?: { person: Person; role: string }[]
  directors?: { person: Person }[]
}

export interface Category {
  id: string
  name: string
  nameAr: string
  slug: string
  description?: string | null
  icon: string
  color: string
  type: 'MOVIE' | 'SERIES' | 'BOTH'
  sortOrder: number
  isActive: boolean
}

export interface Person {
  id: string
  name: string
  nameAr?: string | null
  slug: string
  bio?: string | null
  bioAr?: string | null
  photo?: string | null
  birthDate?: Date | null
  nationality?: string | null
}

export interface Banner {
  id: string
  title: string
  subtitle?: string | null
  description?: string | null
  image: string
  movieId?: string | null
  seriesId?: string | null
  sortOrder: number
  isActive: boolean
}

export interface User {
  id: string
  email: string
  username: string
  name?: string | null
  avatar?: string | null
  role: 'USER' | 'ADMIN' | 'MODERATOR'
  isActive: boolean
  createdAt: Date
}
