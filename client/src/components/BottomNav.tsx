import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const BottomNav = () => {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-lighter border-t border-dark-border">
      <div className="flex items-center justify-around h-16">
        <Link
          to="/feed"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/feed') ? 'text-purple' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span className="text-xs">Home</span>
        </Link>

        <Link
          to="/live"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/live') ? 'text-purple' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
          <span className="text-xs">Live</span>
        </Link>

        <Link
          to={`/profile/${user?.username}`}
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive(`/profile/${user?.username}`) ? 'text-purple' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  )
}

export default BottomNav