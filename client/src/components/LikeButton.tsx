import { useState } from 'react'
import { api } from '../api/client'

interface LikeButtonProps {
  postId: string
  isLiked: boolean
  likeCount: number
  onUpdate: (isLiked: boolean) => void
}

const LikeButton = ({ postId, isLiked, likeCount, onUpdate }: LikeButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      if (isLiked) {
        await api.post(`/posts/${postId}/unlike`)
        onUpdate(false)
      } else {
        await api.post(`/posts/${postId}/like`)
        onUpdate(true)
      }
    } catch (error) {
      console.error('Like error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center space-x-2 transition-colors ${
        isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
      }`}
    >
      <svg
        className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{likeCount}</span>
    </button>
  )
}

export default LikeButton