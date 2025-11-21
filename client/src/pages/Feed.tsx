import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api/client'
import { Post } from '../types'
import PostCard from '../components/PostCard'
import PostComposer from '../components/PostComposer'

const Feed = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = async (pageNum = 1, reset = false) => {
    try {
      const response = await api.get(`/posts/feed?page=${pageNum}&limit=10`)
      const { posts: newPosts, hasMore: more } = response.data

      if (reset) {
        setPosts(newPosts)
      } else {
        setPosts(prev => [...prev, ...newPosts])
      }

      setHasMore(more)
      setPage(pageNum)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load feed')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPosts(1, true)
    }
  }, [user])

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p))
  }

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev])
  }

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(prev => prev.filter(p => p._id !== deletedPostId))
  }

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setIsLoading(true)
      fetchPosts(page + 1)
    }
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Feed</h1>
        <button
          onClick={() => setShowComposer(true)}
          className="btn-success flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Create Post</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎤</div>
          <h2 className="text-xl font-bold text-white mb-2">Your feed is empty</h2>
          <p className="text-gray-400 mb-6">
            Follow other users or create your first post to get started!
          </p>
          <button
            onClick={() => setShowComposer(true)}
            className="btn-primary"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="space-y-0">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpdate={handlePostUpdate}
              onDelete={handlePostDeleted}
            />
          ))}

          {hasMore && (
            <div className="text-center py-6">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="btn-secondary"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}

      {showComposer && (
        <PostComposer
          onPostCreated={handlePostCreated}
          onClose={() => setShowComposer(false)}
        />
      )}

      <div className="fixed bottom-20 right-4 md:bottom-4">
        <button
          onClick={() => setShowComposer(true)}
          className="w-14 h-14 bg-green hover:bg-green-dark rounded-full flex items-center justify-center shadow-lg transition-colors md:hidden"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Feed