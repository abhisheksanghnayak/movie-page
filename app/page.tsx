"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Star, Calendar, Clock, ArrowLeft, Home, SearchIcon, User, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// OMDB API configuration
const OMDB_API_KEY = "33583da4"
const OMDB_BASE_URL = "https://www.omdbapi.com/"

const VALID_USERS = [
  { name: "Abhishek", email: "abhishek@example.com", password: "1234" },
  { name: "Ankush", email: "ankush@example.com", password: "5678" },
  { name: "Akhila", email: "gakhila@example.com", password: "5678" },
]

interface Movie {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
  Plot?: string
  Director?: string
  Actors?: string
  Genre?: string
  Runtime?: string
  imdbRating?: string
  Rated?: string
  Released?: string
  Awards?: string
  BoxOffice?: string
  Country?: string
  Language?: string
  Writer?: string
  Ratings?: Array<{
    Source: string
    Value: string
  }>
}

interface SearchResponse {
  Search: Movie[]
  totalResults: string
  Response: string
  Error?: string
}

export default function MovieSearchApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null)
  const [currentPage, setCurrentPage] = useState<"home" | "search" | "details">("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    if (loginForm.email.trim() && loginForm.password.trim()) {
      const user = VALID_USERS.find(
        (u) =>
          u.email.toLowerCase() === loginForm.email.toLowerCase().trim() && u.password === loginForm.password.trim(),
      )

      if (user) {
        setIsAuthenticated(true)
        setCurrentUser({ name: user.name, email: user.email })
        setLoginForm({ email: "", password: "" })
      } else {
        setLoginError("❌ Invalid email or password")
      }
    } else {
      setLoginError("Please enter both email and password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentPage("home")
    setLoginForm({ email: "", password: "" })
    setCurrentUser(null)
  }

  // Fetch trending movies on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchTrendingMovies()
    }
  }, [isAuthenticated])

  const fetchTrendingMovies = async () => {
    setLoading(true)
    try {
      // Since OMDB doesn't have a trending endpoint, we'll search for popular movies
      const popularMovies = ["Avengers", "Spider-Man", "Batman", "Star Wars", "Marvel", "Guardians"]
      const moviePromises = popularMovies.map(async (movie) => {
        const response = await fetch(`${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${movie}&type=movie`)
        const data: SearchResponse = await response.json()
        return data.Search ? data.Search.slice(0, 2) : []
      })

      const results = await Promise.all(moviePromises)
      const allMovies = results.flat().slice(0, 12)
      setTrendingMovies(allMovies)
    } catch (err) {
      setError("Failed to fetch trending movies")
    } finally {
      setLoading(false)
    }
  }

  const searchMovies = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${query}&type=movie`)
      const data: SearchResponse = await response.json()

      if (data.Response === "True") {
        setSearchResults(data.Search)
      } else {
        setError(data.Error || "No movies found")
        setSearchResults([])
      }
    } catch (err) {
      setError("Failed to search movies")
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMovieDetails = async (imdbID: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbID}&plot=full`)
      const data: Movie = await response.json()
      setSelectedMovie(data)
      setCurrentPage("details")
    } catch (err) {
      setError("Failed to fetch movie details")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchMovies(searchQuery)
      setCurrentPage("search")
    }
  }

  const LoginPage = () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card border-border shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">🔑 Login</CardTitle>
            <p className="text-muted-foreground">Sign in to discover amazing movies</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="pl-10 bg-input border-border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="pl-10 pr-10 bg-input border-border"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              <p>Demo credentials:</p>
              <div className="space-y-1 font-mono text-xs">
                <p>abhishek@example.com | 1234</p>
                <p>ankush@example.com | 5678</p>
                <p>gakhila@example.com | 5678</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const MovieCard = ({ movie, onClick }: { movie: Movie; onClick: () => void }) => (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card border-border"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder.svg?height=400&width=300&query=movie+poster"}
            alt={movie.Title}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-sm font-medium truncate">{movie.Title}</p>
            <p className="text-xs text-gray-300">{movie.Year}</p>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground truncate">{movie.Title}</h3>
          <p className="text-sm text-muted-foreground">{movie.Year}</p>
        </div>
      </CardContent>
    </Card>
  )

  const Navigation = () => (
    <nav className="bg-card border-b border-border p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold text-foreground">🎬 Movie Search</h1>
          <div className="flex space-x-4">
            <Button
              variant={currentPage === "home" ? "default" : "ghost"}
              onClick={() => setCurrentPage("home")}
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Button>
            <Button
              variant={currentPage === "search" ? "default" : "ghost"}
              onClick={() => setCurrentPage("search")}
              className="flex items-center space-x-2"
            >
              <SearchIcon className="w-4 h-4" />
              <span>Search</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter Bollywood or Hollywood movie name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-input border-border"
            />
            <Button type="submit" size="sm">
              <Search className="w-4 h-4" />
            </Button>
          </form>

          <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2 bg-transparent">
            <User className="w-4 h-4" />
            <span>{currentUser?.name || "Logout"}</span>
          </Button>
        </div>
      </div>
    </nav>
  )

  const HomePage = () => (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-foreground mb-4">Discover Amazing Movies</h2>
        <p className="text-xl text-muted-foreground">Explore trending movies and find your next favorite film</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {trendingMovies.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} onClick={() => fetchMovieDetails(movie.imdbID)} />
          ))}
        </div>
      )}
    </div>
  )

  const SearchPage = () => (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Search Results</h2>
        <Button variant="outline" onClick={() => setCurrentPage("home")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {searchResults.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} onClick={() => fetchMovieDetails(movie.imdbID)} />
          ))}
        </div>
      )}
    </div>
  )

  const MovieDetailsPage = () => {
    if (!selectedMovie) return null

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => setCurrentPage("home")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <img
                src={
                  selectedMovie.Poster !== "N/A"
                    ? selectedMovie.Poster
                    : "/placeholder.svg?height=600&width=400&query=movie+poster"
                }
                alt={selectedMovie.Title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{selectedMovie.Title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  {selectedMovie.Year && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {selectedMovie.Year}
                    </div>
                  )}
                  {selectedMovie.Runtime && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {selectedMovie.Runtime}
                    </div>
                  )}
                  {selectedMovie.imdbRating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {selectedMovie.imdbRating}/10
                    </div>
                  )}
                </div>

                {selectedMovie.Genre && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedMovie.Genre.split(", ").map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {selectedMovie.Plot && (
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Plot</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedMovie.Plot}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {selectedMovie.Director && (
                  <div>
                    <h4 className="font-semibold text-foreground">Director</h4>
                    <p className="text-muted-foreground">{selectedMovie.Director}</p>
                  </div>
                )}

                {selectedMovie.Actors && (
                  <div>
                    <h4 className="font-semibold text-foreground">Cast</h4>
                    <p className="text-muted-foreground">{selectedMovie.Actors}</p>
                  </div>
                )}

                {selectedMovie.Released && (
                  <div>
                    <h4 className="font-semibold text-foreground">Release Date</h4>
                    <p className="text-muted-foreground">{selectedMovie.Released}</p>
                  </div>
                )}

                {selectedMovie.BoxOffice && (
                  <div>
                    <h4 className="font-semibold text-foreground">Box Office</h4>
                    <p className="text-muted-foreground">{selectedMovie.BoxOffice}</p>
                  </div>
                )}
              </div>

              {selectedMovie.Awards && (
                <div>
                  <h4 className="font-semibold text-foreground">Awards</h4>
                  <p className="text-muted-foreground">{selectedMovie.Awards}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        {currentPage === "home" && <HomePage />}
        {currentPage === "search" && <SearchPage />}
        {currentPage === "details" && <MovieDetailsPage />}
      </main>
    </div>
  )
}
