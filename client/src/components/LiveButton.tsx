import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const LiveButton = () => {
  const [isCreating, setIsCreating] = useState(false)
  const navigate = useNavigate()

  const handleGoLive = async () => {
    setIsCreating(true)
    try {
      const response = await api.post('/livestreams')
      const { roomId } = response.data.stream
      navigate(`/live/${roomId}?mode=host`)
    } catch (error: any) {
      console.error('Failed to create live stream:', error)
      alert(error.response?.data?.error || 'Failed to start live stream')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <button
      onClick={handleGoLive}
      disabled={isCreating}
      className="btn-success flex items-center space-x-2"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
      </svg>
      <span>{isCreating ? 'Starting...' : 'Go Live'}</span>
    </button>
  )
}

export default LiveButton