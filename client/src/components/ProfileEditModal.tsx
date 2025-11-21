import { useState, useRef } from 'react'
import { api } from '../api/client'
import { User } from '../types'

interface ProfileEditModalProps {
  user: User
  onClose: () => void
  onUpdate: (updatedUser: Partial<User>) => void
}

const ProfileEditModal = ({ user, onClose, onUpdate }: ProfileEditModalProps) => {
  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [bio, setBio] = useState(user.bio || '')
  const [location, setLocation] = useState(user.location || '')
  const [link1, setLink1] = useState(user.socialLinks?.link1 || '')
  const [link2, setLink2] = useState(user.socialLinks?.link2 || '')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(user.profileImageUrl || '')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let updatedProfileImageUrl = user.profileImageUrl

      // Update profile picture if changed
      if (profileImage) {
        const formData = new FormData()
        formData.append('profilePicture', profileImage)

        console.log('Uploading profile picture...')
        const pictureResponse = await api.put('/users/profile/picture', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        updatedProfileImageUrl = pictureResponse.data.profileImageUrl
        console.log('Profile picture uploaded:', updatedProfileImageUrl)
      }

      // Update other profile fields
      const profileData = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        link1: link1.trim(),
        link2: link2.trim()
      }

      console.log('Updating profile data:', profileData)
      const response = await api.put('/users/profile', profileData)

      // Merge all updates
      const updatedUser = {
        ...response.data.user,
        profileImageUrl: updatedProfileImageUrl
      }

      console.log('Profile updated successfully:', updatedUser)
      onUpdate(updatedUser)
      onClose()
    } catch (error: any) {
      console.error('Profile update error:', error)
      alert(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-secondary rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-secondary border-b border-dark-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden bg-dark-card cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-2">Click to change profile picture</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple"
              maxLength={50}
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple"
              maxLength={100}
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Social Links
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <input
                  type="url"
                  value={link1}
                  onChange={(e) => setLink1(e.target.value)}
                  placeholder="https://your-link.com"
                  className="flex-1 px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple"
                />
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <input
                  type="url"
                  value={link2}
                  onChange={(e) => setLink2(e.target.value)}
                  placeholder="https://another-link.com"
                  className="flex-1 px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-dark-card text-white rounded-lg hover:bg-dark-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-purple text-white rounded-lg hover:bg-purple-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileEditModal