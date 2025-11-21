import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api/client'
import { LiveStream } from '../types'
import LiveButton from '../components/LiveButton'
import UserAvatar from '../components/UserAvatar'

const Live = () => {
  const { user } = useAuth()
  const [activeStreams, setActiveStreams] = useState<LiveStream[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchActiveStreams = async () => {
    try {
      const response = await api.get('/livestreams/active')
      setActiveStreams(response.data.streams)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load streams')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveStreams()

    // Refresh streams every 10 seconds
    const interval = setInterval(fetchActiveStreams, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (startedAt: string) => {
    const start = new Date(startedAt)
    const now = new Date()
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000)

    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Live Streams</h1>
        <LiveButton />
      </div>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading streams...</p>
          </div>
        </div>
      ) : activeStreams.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📺</div>
          <h2 className="text-xl font-bold text-white mb-2">No Live Streams</h2>
          <p className="text-gray-400 mb-6">
            No one is streaming right now. Be the first to go live!
          </p>
          <LiveButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeStreams.map((stream) => (
            <Link
              key={stream._id}
              to={`/live/${stream.roomId}?mode=viewer`}
              className="card p-0 hover:border-purple transition-colors group"
            >
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-purple to-purple-dark flex items-center justify-center">
                  <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                </div>

                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    LIVE
                  </span>
                  <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                    {formatDuration(stream.startedAt)}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <UserAvatar user={stream.host} size="sm" />
                  <div>
                    <p className="font-medium text-white group-hover:text-purple transition-colors">
                      {stream.host.displayName}
                    </p>
                    <p className="text-sm text-gray-400">@{stream.host.username}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 card p-6">
        <h3 className="text-lg font-bold text-white mb-4">About Live Streaming</h3>
        <div className="space-y-2 text-gray-300">
          <p>• Live streams are limited to 4 minutes</p>
          <p>• Share your freestyle, beats, or studio sessions</p>
          <p>• Connect with other artists in real-time</p>
          <p>• Stream ends automatically after 4 minutes</p>
        </div>

        <div className="mt-4 p-3 bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg">
          <p className="text-yellow-300 text-sm">
            <strong>Note:</strong> This is an MVP implementation using simple WebRTC signaling.
            In production, this would use dedicated streaming infrastructure with TURN/STUN servers for better connectivity.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Live