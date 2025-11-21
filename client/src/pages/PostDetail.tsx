import { useState, useEffect } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api/client'
import { Post } from '../types'
import UserAvatar from '../components/UserAvatar'
import LikeButton from '../components/LikeButton'
import CommentSection from '../components/CommentSection'

const PostDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPost = async () => {
    if (!id) return

    try {
      const response = await api.get(`/posts/${id}`)
      setPost(response.data.post)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Post not found')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPost()
  }, [id])

  const handleLikeUpdate = async (isLiked: boolean) => {
    if (!post) return

    const updatedPost = {
      ...post,
      isLiked,
      likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1
    }
    setPost(updatedPost)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-white mb-2">Post Not Found</h1>
          <p className="text-gray-400">{error || 'This post does not exist'}</p>
          <Link to="/feed" className="btn-primary mt-4 inline-block">
            Back to Feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="mb-4">
        <Link
          to="/feed"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Feed</span>
        </Link>
      </div>

      <article className="card p-0 mb-6">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Link to={`/profile/${post.author.username}`}>
              <UserAvatar user={post.author} size="md" />
            </Link>
            <div className="flex-1">
              <Link
                to={`/profile/${post.author.username}`}
                className="font-medium text-white hover:text-purple transition-colors"
              >
                {post.author.displayName}
              </Link>
              <p className="text-sm text-gray-400">@{post.author.username}</p>
            </div>
            <span className="text-sm text-gray-400">
              {formatDate(post.createdAt)}
            </span>
          </div>

          {post.caption && (
            <p className="text-white mb-4 text-lg">{post.caption}</p>
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

        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <LikeButton
              postId={post._id}
              isLiked={post.isLiked || false}
              likeCount={post.likeCount}
              onUpdate={handleLikeUpdate}
            />

            <div className="flex items-center space-x-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.724-.446l-3.615 1.072a.75.75 0 01-.935-.935l1.072-3.615A8.955 8.955 0 014 12a8 8 0 118 8z" />
              </svg>
              <span>{post.commentCount} comments</span>
            </div>
          </div>

          <CommentSection postId={post._id} />
        </div>
      </article>
    </div>
  )
}

export default PostDetail