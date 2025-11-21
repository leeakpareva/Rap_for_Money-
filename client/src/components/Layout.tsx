import { ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from './Navbar'
import BottomNav from './BottomNav'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth()
  const location = useLocation()

  const isAuthPage = location.pathname.startsWith('/auth')
  const showNavigation = user && !isAuthPage

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-dark">
      {showNavigation && <Navbar />}

      <main className={`${showNavigation ? 'pt-16 pb-20 md:pb-0' : ''}`}>
        <div className="max-w-2xl mx-auto px-4">
          {children}
        </div>
      </main>

      {showNavigation && (
        <>
          <div className="md:hidden">
            <BottomNav />
          </div>
        </>
      )}
    </div>
  )
}

export default Layout