import { createContext, useContext, useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  sendNotification: (targetUserId: string, type: string, message: string) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { token, user } = useAuth()

  useEffect(() => {
    if (token && user) {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['polling'] // Use polling for Vercel compatibility
      })

      newSocket.on('connect', () => {
        console.log('Connected to server')
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server')
        setIsConnected(false)
      })

      newSocket.on('notification', (notification) => {
        console.log('New notification:', notification)
        // You can add toast notification here
        showNotification(notification)
      })

      newSocket.on('post_liked', (data) => {
        console.log('Post liked:', data)
        // Handle real-time like update
      })

      newSocket.on('post_unliked', (data) => {
        console.log('Post unliked:', data)
        // Handle real-time unlike update
      })

      newSocket.on('comment_added', (data) => {
        console.log('Comment added:', data)
        // Handle real-time comment update
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [token, user])

  const sendNotification = (targetUserId: string, type: string, message: string) => {
    if (socket) {
      socket.emit('send_notification', { targetUserId, type, message })
    }
  }

  const showNotification = (notification: any) => {
    // Simple browser notification for now
    if (Notification.permission === 'granted') {
      new Notification(`${notification.fromUser} ${notification.message}`, {
        icon: '/logo.png'
      })
    }
  }

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const value = {
    socket,
    isConnected,
    sendNotification
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}