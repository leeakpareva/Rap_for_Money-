import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api/client'
import { LiveStream } from '../types'
import { useWebRTC } from '../hooks/useWebRTC'
import UserAvatar from '../components/UserAvatar'

const LiveRoom = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stream, setStream] = useState<LiveStream | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(240) // 4 minutes

  const mode = searchParams.get('mode') as 'host' | 'viewer'
  const isHost = mode === 'host'

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const {
    localStream,
    remoteStream,
    isConnected,
    error: webrtcError,
    isInitialized,
    initialize,
    stopStream
  } = useWebRTC({
    roomId: roomId!,
    isHost,
    onStreamEnd: () => navigate('/live')
  })

  const fetchStreamInfo = async () => {
    if (!roomId) return

    try {
      const response = await api.get(`/livestreams/${roomId}`)
      setStream(response.data.stream)

      if (!response.data.stream.isActive) {
        setError('This stream has ended')
        return
      }

      // Calculate time left
      const startTime = new Date(response.data.stream.startedAt).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      const remaining = Math.max(0, 240 - elapsed)
      setTimeLeft(remaining)

    } catch (error: any) {
      setError(error.response?.data?.error || 'Stream not found')
    } finally {
      setIsLoading(false)
    }
  }

  const endStream = async () => {
    try {
      await api.post(`/livestreams/${roomId}/end`)
      stopStream()
      navigate('/live')
    } catch (error) {
      console.error('Failed to end stream:', error)
    }
  }

  useEffect(() => {
    fetchStreamInfo()
  }, [roomId])

  useEffect(() => {
    if (!isLoading && stream?.isActive && !webrtcError) {
      initialize()
    }
  }, [isLoading, stream, webrtcError, initialize])

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Timer countdown
  useEffect(() => {
    if (!stream?.isActive || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1
        if (newTime <= 0 && isHost) {
          endStream()
        }
        return Math.max(0, newTime)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [stream?.isActive, timeLeft, isHost])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (!roomId) {
    return <Navigate to="/live" replace />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading stream...</p>
        </div>
      </div>
    )
  }

  if (error || !stream) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📺</div>
          <h1 className="text-2xl font-bold text-white mb-2">Stream Not Available</h1>
          <p className="text-gray-400 mb-6">{error || 'Stream not found'}</p>
          <button onClick={() => navigate('/live')} className="btn-primary">
            Back to Live Streams
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/live')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
              LIVE
            </span>
            <span className="text-white font-mono">
              {formatTime(timeLeft)}
            </span>
          </div>

          {isHost && (
            <button
              onClick={endStream}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              End Stream
            </button>
          )}
        </div>
      </div>

      {(webrtcError || error) && (
        <div className="bg-red-600 text-white p-3 rounded-lg mb-6">
          {webrtcError || error}
        </div>
      )}

      <div className="space-y-6">
        {/* Host Info */}
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <UserAvatar user={stream.host} size="md" />
            <div>
              <h2 className="text-lg font-bold text-white">{stream.host.displayName}</h2>
              <p className="text-gray-400">@{stream.host.username}</p>
            </div>
            <div className="ml-auto">
              <span className="text-sm text-gray-400">
                {isHost ? 'You are hosting' : 'Hosted by'}
              </span>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Video (Remote for viewer, Local for host) */}
          <div className="card p-0 overflow-hidden">
            <div className="relative aspect-video bg-black">
              {isHost ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}

              {!isInitialized && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple mx-auto mb-2"></div>
                    <p className="text-white text-sm">
                      {isHost ? 'Starting your stream...' : 'Connecting to stream...'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">
                  {isHost ? 'Your Stream' : `${stream.host.displayName}'s Stream`}
                </span>
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-400">
                    {isConnected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Video (Local for viewer, Remote for host) */}
          {!isHost && (
            <div className="card p-0 overflow-hidden">
              <div className="relative aspect-video bg-black">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <span className="text-white font-medium">Your Camera</span>
              </div>
            </div>
          )}
        </div>

        {/* Stream Info */}
        <div className="card p-4">
          <h3 className="text-lg font-bold text-white mb-3">Stream Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Status:</span>
              <span className="text-white ml-2">
                {stream.isActive ? 'Active' : 'Ended'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Started:</span>
              <span className="text-white ml-2">
                {new Date(stream.startedAt).toLocaleTimeString()}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Time Remaining:</span>
              <span className="text-white ml-2">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-600 bg-opacity-20 border border-blue-600 rounded-lg">
            <p className="text-blue-300 text-sm">
              <strong>MVP Note:</strong> This is a simplified WebRTC implementation.
              Audio/video quality may vary depending on network conditions.
              Streams automatically end after 4 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveRoom