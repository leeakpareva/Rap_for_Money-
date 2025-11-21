import { useState } from 'react'
import { api } from '../api/client'
import { useSocket } from '../contexts/SocketContext'

interface TipButtonProps {
  targetUserId: string
  targetUsername: string
  postId?: string
  onTipSent?: () => void
}

const TipButton = ({ targetUserId, targetUsername, postId, onTipSent }: TipButtonProps) => {
  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState(100) // in cents
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { sendNotification } = useSocket()

  const predefinedAmounts = [50, 100, 200, 500, 1000] // $0.50, $1, $2, $5, $10

  const handleSendTip = async () => {
    setIsSending(true)
    try {
      await api.post('/tips', {
        toUserId: targetUserId,
        amount,
        message: message.trim(),
        postId
      })

      // Send real-time notification
      sendNotification(targetUserId, 'tip', `sent you a tip of $${(amount / 100).toFixed(2)}!`)

      setShowModal(false)
      setAmount(100)
      setMessage('')
      onTipSent?.()

      // Show success message
      alert(`Tip sent successfully to @${targetUsername}!`)
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send tip')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
        title="Send tip"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span className="text-sm">Tip</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                Send Tip to @{targetUsername}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {predefinedAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        amount === preset
                          ? 'bg-purple text-white'
                          : 'bg-dark-card text-gray-400 hover:text-white'
                      }`}
                    >
                      ${(preset / 100).toFixed(2)}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                    className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    ¢
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ${(amount / 100).toFixed(2)} USD
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Say something nice..."
                  maxLength={200}
                  className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length}/200 characters
                </p>
              </div>

              <div className="bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">
                  <strong>MVP Note:</strong> This is a simulated payment system.
                  In production, this would integrate with real payment processors.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-border text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendTip}
                  disabled={isSending || amount < 1}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? 'Sending...' : `Send $${(amount / 100).toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TipButton