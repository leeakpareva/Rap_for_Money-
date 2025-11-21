import { useState } from 'react'
import { api } from '../api/client'

interface FollowButtonProps {
  userId: string
  isFollowing: boolean
  onUpdate: (isFollowing: boolean) => void
}

const FollowButton = ({ userId, isFollowing, onUpdate }: FollowButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      if (isFollowing) {
        await api.post(`/users/${userId}/unfollow`)
        onUpdate(false)
      } else {
        await api.post(`/users/${userId}/follow`)
        onUpdate(true)
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
        isFollowing
          ? 'bg-gray-600 text-white hover:bg-gray-700'
          : 'bg-purple text-white hover:bg-purple-dark'
      }`}
    >
      {isLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  )
}

export default FollowButton