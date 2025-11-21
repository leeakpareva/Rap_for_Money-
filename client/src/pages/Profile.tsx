import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api/client'
import { User, Post } from '../types'
import UserAvatar from '../components/UserAvatar'
import FollowButton from '../components/FollowButton'
import PostCard from '../components/PostCard'
import ProfileEditModal from '../components/ProfileEditModal'

const Profile = () => {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser } = useAuth()
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchProfile = async () => {
    if (!username) return

    try {
      const [profileResponse, postsResponse] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/posts`)
      ])

      setProfileUser(profileResponse.data.user)
      setPosts(postsResponse.data.posts)

      if (currentUser) {
        const followStatus = false
        setIsFollowing(followStatus)
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'User not found')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [username, currentUser])

  const handleFollowUpdate = (following: boolean) => {
    setIsFollowing(following)
    if (profileUser) {
      setProfileUser({
        ...profileUser,
        followersCount: following
          ? (profileUser.followersCount || 0) + 1
          : Math.max((profileUser.followersCount || 0) - 1, 0)
      })
    }
  }

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p))
  }

  const handleProfileUpdate = (updatedData: Partial<User>) => {
    if (profileUser) {
      setProfileUser({ ...profileUser, ...updatedData })
    }
  }

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-400">{error || 'This user does not exist'}</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser.id === profileUser.id

  return (
    <div className="py-6">
      <div className="card p-6 mb-6">
        {profileUser.bannerImageUrl && (
          <div className="h-32 md:h-48 rounded-lg mb-4 overflow-hidden">
            <img
              src={profileUser.bannerImageUrl}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start space-x-4 mb-4">
          <UserAvatar user={profileUser} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{profileUser.displayName}</h1>
            <p className="text-gray-400 mb-2">@{profileUser.username}</p>

            {profileUser.bio && (
              <p className="text-gray-300 mb-3 whitespace-pre-wrap">{profileUser.bio}</p>
            )}

            {profileUser.socialLinks && (profileUser.socialLinks.link1 || profileUser.socialLinks.link2) && (
              <div className="flex items-center space-x-3 mb-3">
                {profileUser.socialLinks.link1 && (
                  <a
                    href={profileUser.socialLinks.link1}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple hover:text-purple-light transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                    </svg>
                  </a>
                )}
                {profileUser.socialLinks.link2 && (
                  <a
                    href={profileUser.socialLinks.link2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple hover:text-purple-light transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
              {profileUser.location && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{profileUser.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Joined {new Date(profileUser.createdAt || '').toLocaleDateString()}</span>
              </div>
            </div>

            {profileUser.genres && profileUser.genres.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {profileUser.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-purple bg-opacity-20 text-purple text-sm rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-6 text-sm mb-4">
              <div>
                <span className="font-semibold text-white">{profileUser.postsCount || 0}</span>
                <span className="text-gray-400 ml-1">posts</span>
              </div>
              <div>
                <span className="font-semibold text-white">{profileUser.followersCount || 0}</span>
                <span className="text-gray-400 ml-1">followers</span>
              </div>
              <div>
                <span className="font-semibold text-white">{profileUser.followingCount || 0}</span>
                <span className="text-gray-400 ml-1">following</span>
              </div>
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-dark-border text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <FollowButton
                userId={profileUser.id}
                isFollowing={isFollowing}
                onUpdate={handleFollowUpdate}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Posts</h2>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isOwnProfile ? "You haven't posted yet" : `${profileUser.displayName} hasn't posted yet`}
            </h3>
            <p className="text-gray-400">
              {isOwnProfile ? 'Share your first freestyle or beat!' : 'Check back later for new content.'}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onUpdate={handlePostUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {showEditModal && profileUser && (
        <ProfileEditModal
          user={profileUser}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  )
}

export default Profile