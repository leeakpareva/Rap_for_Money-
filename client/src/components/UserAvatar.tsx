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

  const displayText = user.displayName ? user.displayName[0].toUpperCase() : 'U'

  return (
    <div
      className={`${sizeClasses[size]} ${className} rounded-full bg-purple flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0`}
    >
      {user.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt={user.displayName || 'Profile'}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.parentElement?.querySelector('span')?.style.setProperty('display', 'block')
          }}
        />
      ) : null}
      <span className={user.profileImageUrl ? 'hidden' : 'block'}>{displayText}</span>
    </div>
  )
}

export default UserAvatar