import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <div className="text-6xl font-bold text-purple mb-4">R4M</div>
          <p className="text-xl text-gray-300 mb-8">Welcome back, {user.displayName}!</p>
          <div className="space-y-4">
            <Link to="/feed" className="block btn-primary text-lg">
              Go to Feed
            </Link>
            <Link to="/live" className="block btn-secondary text-lg">
              Check Live Streams
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6 px-4">
        <div className="text-6xl font-bold text-purple mb-4">R4M</div>
        <h1 className="text-3xl font-bold text-white mb-4">Rap For Money</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-md">
          A community platform built for rappers, producers, engineers and fans who live and breathe hip-hop culture.
        </p>

        <div className="space-y-4">
          <Link to="/auth/register" className="block btn-primary text-lg">
            Get Started
          </Link>
          <Link to="/auth/login" className="block btn-secondary text-lg">
            Sign In
          </Link>
          <Link to="/about" className="block text-purple hover:text-purple-dark transition-colors">
            Learn More
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home