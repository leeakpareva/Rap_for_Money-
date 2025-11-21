import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { Post } from '../types'
import PostCard from '../components/PostCard'

interface TrendingHashtag {
  hashtag: string
  count: number
}

const Trending = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [hashtags, setHashtags] = useState<TrendingHashtag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'hashtags'>('posts')

  const fetchTrendingPosts = async () => {
    try {
      const response = await api.get('/posts/trending')
      setPosts(response.data.posts)
    } catch (error) {
      console.error('Failed to fetch trending posts:', error)
    }
  }

  const fetchTrendingHashtags = async () => {
    try {
      const response = await api.get('/posts/hashtags/trending')
      setHashtags(response.data.hashtags)
    } catch (error) {
      console.error('Failed to fetch trending hashtags:', error)
    }
  }

  useEffect(() => {
    Promise.all([fetchTrendingPosts(), fetchTrendingHashtags()])
      .finally(() => setIsLoading(false))
  }, [])

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p))
  }

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(prev => prev.filter(p => p._id !== deletedPostId))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading trending content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Trending</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'posts'
                ? 'bg-purple text-white'
                : 'bg-dark-card text-gray-400 hover:text-white'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('hashtags')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'hashtags'
                ? 'bg-purple text-white'
                : 'bg-dark-card text-gray-400 hover:text-white'
            }`}
          >
            Hashtags
          </button>
        </div>
      </div>

      {activeTab === 'posts' ? (
        <div className="space-y-0">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <div key={post._id} className="relative">
                {index < 3 && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                      #{index + 1} Trending
                    </div>
                  </div>
                )}
                <PostCard
                  post={post}
                  onUpdate={handlePostUpdate}
                  onDelete={handlePostDeleted}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔥</div>
              <h2 className="text-xl font-bold text-white mb-2">No trending posts yet</h2>
              <p className="text-gray-400">Be the first to create viral content!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hashtags.length > 0 ? (
            hashtags.map((item, index) => (
              <Link
                key={item.hashtag}
                to={`/hashtag/${item.hashtag}`}
                className="card p-4 hover:border-purple transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-purple font-bold text-lg">#{item.hashtag}</h3>
                    <p className="text-gray-400 text-sm">{item.count} posts</p>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-500 font-bold">#{index + 1}</div>
                    <div className="text-xs text-gray-500">trending</div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">#️⃣</div>
              <h2 className="text-xl font-bold text-white mb-2">No trending hashtags yet</h2>
              <p className="text-gray-400">Start using hashtags in your posts!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Trending