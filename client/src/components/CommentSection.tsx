import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { Comment } from '../types'
import { useAuth } from '../contexts/AuthContext'
import UserAvatar from './UserAvatar'

interface CommentSectionProps {
  postId: string
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchComments = async () => {
    try {
      const response = await api.get(`/posts/${postId}/comments`)
      setComments(response.data.comments)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        text: newComment.trim()
      })

      setComments(prev => [response.data.comment, ...prev])
      setNewComment('')
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.ceil(diffTime / (1000 * 60))

    if (diffMinutes < 60) return `${diffMinutes}m`
    if (diffMinutes < 1440) return `${Math.ceil(diffMinutes / 60)}h`
    return `${Math.ceil(diffMinutes / 1440)}d`
  }

  return (
    <div className="space-y-4">
      {user && (
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <UserAvatar user={user} size="sm" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 bg-dark-lighter border border-dark-border rounded-lg focus:outline-none focus:border-purple resize-none"
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple mx-auto"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex space-x-3">
              <UserAvatar user={comment.author} size="sm" />
              <div className="flex-1">
                <div className="bg-dark-lighter rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-white">
                      {comment.author.displayName}
                    </span>
                    <span className="text-sm text-gray-400">
                      @{comment.author.username}
                    </span>
                    <span className="text-sm text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-300">{comment.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentSection