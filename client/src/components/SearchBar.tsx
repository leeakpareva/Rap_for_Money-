import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { User } from '../types'
import UserAvatar from './UserAvatar'

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`)
      setResults(response.data.users)
      setShowResults(true)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => searchUsers(query), 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          className="w-full px-4 py-2 pl-10 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-card border border-dark-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((user) => (
                <Link
                  key={user._id || user.id}
                  to={`/profile/${user.username}`}
                  onClick={() => {
                    setShowResults(false)
                    setQuery('')
                  }}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-dark-border transition-colors"
                >
                  <UserAvatar user={user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{user.displayName}</p>
                    <p className="text-gray-400 text-sm truncate">@{user.username}</p>
                    {user.bio && (
                      <p className="text-gray-500 text-xs truncate mt-1">{user.bio}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : query && !isSearching ? (
            <div className="p-4 text-center text-gray-400">
              No users found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SearchBar