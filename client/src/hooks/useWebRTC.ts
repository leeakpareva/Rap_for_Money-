import { useState, useRef, useCallback, useEffect } from 'react'
import { api } from '../api/client'
import { SignalMessage } from '../types'

interface UseWebRTCProps {
  roomId: string
  isHost: boolean
  onStreamEnd?: () => void
}

export const useWebRTC = ({ roomId, isHost, onStreamEnd }: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const lastSignalTimestamp = useRef<number>(0)

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }

  const sendSignal = useCallback(async (type: string, data: any) => {
    try {
      await api.post(`/livestreams/${roomId}/signal`, {
        type,
        data
      })
    } catch (error) {
      console.error('Failed to send signal:', error)
    }
  }, [roomId])

  const pollSignals = useCallback(async () => {
    try {
      const response = await api.get(`/livestreams/${roomId}/signal?since=${lastSignalTimestamp.current}`)
      const messages: SignalMessage[] = response.data.messages

      for (const message of messages) {
        if (message.timestamp > lastSignalTimestamp.current) {
          lastSignalTimestamp.current = message.timestamp

          if (peerConnection.current && message.from !== 'self') {
            switch (message.type) {
              case 'offer':
                if (!isHost) {
                  await peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.data))
                  const answer = await peerConnection.current.createAnswer()
                  await peerConnection.current.setLocalDescription(answer)
                  await sendSignal('answer', answer)
                }
                break

              case 'answer':
                if (isHost) {
                  await peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.data))
                }
                break

              case 'ice-candidate':
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(message.data))
                break
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to poll signals:', error)
    }
  }, [roomId, isHost, sendSignal])

  const initializePeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(configuration)

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('ice-candidate', event.candidate)
      }
    }

    pc.ontrack = (event) => {
      console.log('Received remote stream')
      setRemoteStream(event.streams[0])
      setIsConnected(true)
    }

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState)
      if (pc.connectionState === 'connected') {
        setIsConnected(true)
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false)
      }
    }

    peerConnection.current = pc
  }, [sendSignal])

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      setLocalStream(stream)

      if (peerConnection.current) {
        stream.getTracks().forEach(track => {
          peerConnection.current!.addTrack(track, stream)
        })

        if (isHost) {
          const offer = await peerConnection.current.createOffer()
          await peerConnection.current.setLocalDescription(offer)
          await sendSignal('offer', offer)
        }
      }

      setIsInitialized(true)
    } catch (error: any) {
      console.error('Failed to start local stream:', error)
      setError('Failed to access camera/microphone: ' + error.message)
    }
  }, [isHost, sendSignal])

  const stopStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }

    if (peerConnection.current) {
      peerConnection.current.close()
      peerConnection.current = null
    }

    setRemoteStream(null)
    setIsConnected(false)
    setIsInitialized(false)
  }, [localStream])

  const initialize = useCallback(async () => {
    try {
      initializePeerConnection()
      await startLocalStream()

      // Start polling for signals
      const interval = setInterval(pollSignals, 1000)
      return () => clearInterval(interval)
    } catch (error: any) {
      setError('Failed to initialize WebRTC: ' + error.message)
    }
  }, [initializePeerConnection, startLocalStream, pollSignals])

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  return {
    localStream,
    remoteStream,
    isConnected,
    error,
    isInitialized,
    initialize,
    stopStream
  }
}