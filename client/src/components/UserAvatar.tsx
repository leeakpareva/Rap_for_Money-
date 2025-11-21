import { User } from '../types'

interface UserAvatarProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const UserAvatar = ({ user, size = 'md', className = '' }: UserAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl'
  }

  const displayText = user.displayName[0].toUpperCase()

  return (
    <div
      className={`${sizeClasses[size]} ${className} rounded-full bg-purple flex items-center justify-center text-white font-semibold`}
    >
      {user.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt={user.displayName}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{displayText}</span>
      )}
    </div>
  )
}

export default UserAvatar