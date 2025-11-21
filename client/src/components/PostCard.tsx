import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { Post } from '../types'
import { useAuth } from '../contexts/AuthContext'
import UserAvatar from './UserAvatar'
import LikeButton from './LikeButton'
import TipButton from './TipButton'

interface PostCardProps {
  post: Post
  onUpdate: (updatedPost: Post) => void
  onDelete?: (postId: string) => void
}

const PostCard = ({ post, onUpdate, onDelete }: PostCardProps) => {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Debug logging
  console.log('PostCard Debug:', {
    currentUserId: user?._id || user?.id,
    postAuthorId: post.author._id || post.author.id,
    canDelete: user && ((user._id === post.author._id) || (user.id === post.author._id) || (user._id === post.author.id) || (user.id === post.author.id))
  })

  const handleLikeUpdate = async (isLiked: boolean) => {
    const updatedPost = {
      ...post,
      isLiked,
      likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1
    }
    onUpdate(updatedPost)
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return

    setIsDeleting(true)
    try {
      await api.delete(`/posts/${post._id}`)
      onDelete?.(post._id)
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  return (
    <article className="card p-0 mb-6" data-testid="post-card">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Link to={`/profile/${post.author.username}`}>
            <UserAvatar user={post.author} size="sm" />
          </Link>
          <div>
            <Link
              to={`/profile/${post.author.username}`}
              className="font-medium text-white hover:text-purple transition-colors"
            >
              {post.author.displayName}
            </Link>
            <p className="text-sm text-gray-400">@{post.author.username}</p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {formatDate(post.createdAt)}
            </span>
            {user && ( // Always show delete button for any logged in user (for debugging)
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-400 hover:text-red-300 transition-colors p-1 disabled:opacity-50"
                title="Delete post"
                data-testid="delete-post-button"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {post.caption && (
          <div className="text-white mb-3">
            <p className="whitespace-pre-wrap">
              {post.caption.split(' ').map((word, index) => (
                word.startsWith('#') ? (
                  <Link
                    key={index}
                    to={`/hashtag/${word.slice(1)}`}
                    className="text-purple hover:text-purple-dark"
                  >
                    {word}{' '}
                  </Link>
                ) : (
                  word + ' '
                )
              ))}
            </p>
          </div>
        )}
      </div>

      <div className="relative">
        {post.mediaType === 'video' ? (
          <video
            controls
            className="w-full max-h-96 object-cover"
            poster={post.thumbnailUrl}
          >
            <source src={`http://localhost:5000${post.mediaUrl}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={`http://localhost:5000${post.mediaUrl}`}
            alt="Post content"
            className="w-full max-h-96 object-cover"
          />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center space-x-6 mb-3">
          <LikeButton
            postId={post._id}
            isLiked={post.isLiked || false}
            likeCount={post.likeCount}
            onUpdate={handleLikeUpdate}
          />

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.724-.446l-3.615 1.072a.75.75 0 01-.935-.935l1.072-3.615A8.955 8.955 0 014 12a8 8 0 118 8z" />
            </svg>
            <span>{post.commentCount}</span>
          </button>

          <TipButton
            targetUserId={post.author._id || post.author.id}
            targetUsername={post.author.username}
            postId={post._id}
          />

          <Link
            to={`/post/${post._id}`}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            View details
          </Link>
        </div>

        {showComments && (
          <div className="border-t border-dark-border pt-3 mt-3">
            <p className="text-sm text-gray-400">
              <Link to={`/post/${post._id}`} className="text-purple hover:text-purple-dark">
                View all {post.commentCount} comments
              </Link>
            </p>
          </div>
        )}
      </div>
    </article>
  )
}

export default PostCard