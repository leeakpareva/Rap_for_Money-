import { useState, useRef } from 'react'
import { api } from '../api/client'
import { Post } from '../types'

interface PostComposerProps {
  onPostCreated: (post: Post) => void
  onClose: () => void
}

const PostComposer = ({ onPostCreated, onClose }: PostComposerProps) => {
  const [caption, setCaption] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File size must be less than 100MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      setError('Only image and video files are allowed')
      return
    }

    setSelectedFile(file)
    setError('')

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('caption', caption)

      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      onPostCreated(response.data.post)
      onClose()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Create Post</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-600 text-white p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3 bg-dark-lighter border border-dark-border rounded-lg focus:outline-none focus:border-purple resize-none"
              rows={3}
              placeholder="What's happening in hip-hop?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Media File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-dark-border rounded-lg text-gray-400 hover:border-purple hover:text-purple transition-colors"
            >
              {selectedFile ? selectedFile.name : 'Click to select image or video'}
            </button>
          </div>

          {previewUrl && (
            <div className="mt-4">
              {selectedFile?.type.startsWith('video/') ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-48 rounded-lg object-cover"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-48 rounded-lg object-cover"
                />
              )}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostComposer