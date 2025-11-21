import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import UserAvatar from './UserAvatar'
import SearchBar from './SearchBar'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-dark-lighter border-b border-dark-border z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/feed" className="text-2xl font-bold text-purple">
            R4M
          </Link>

          <div className="flex items-center space-x-6">
            <SearchBar />
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/feed" className="hover:text-purple transition-colors">
                Feed
              </Link>
              <Link to="/live" className="hover:text-purple transition-colors">
                Live
              </Link>
              <Link to="/about" className="hover:text-purple transition-colors">
                About
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Link to={`/profile/${user.username}`}>
                  <UserAvatar user={user} size="sm" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar