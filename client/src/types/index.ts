export interface User {
  _id: string
  id: string
  username: string
  displayName: string
  email?: string
  bio?: string
  location?: string
  profileImageUrl?: string
  bannerImageUrl?: string
  genres?: string[]
  roles: string[]
  followersCount?: number
  followingCount?: number
  postsCount?: number
  createdAt?: string
}

export interface Post {
  _id: string
  author: User
  caption?: string
  mediaType: 'image' | 'video'
  mediaUrl: string
  thumbnailUrl?: string
  likeCount: number
  commentCount: number
  likes: string[]
  isLiked?: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  post: string
  author: User
  text: string
  createdAt: string
}

export interface LiveStream {
  _id: string
  host: User
  isActive: boolean
  roomId: string
  startedAt: string
  endedAt?: string
  maxDurationSeconds: number
}

export interface AuthResponse {
  token: string
  user: User
}

export interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate'
  from: string
  to?: string
  data: any
  timestamp: number
}