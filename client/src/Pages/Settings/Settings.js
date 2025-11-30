import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../Hooks/useAuthContext'
import './SettingsStyles.css'
import {API_BASE_URL} from '../../config/api'

const Settings = () => {
  const navigate = useNavigate()
  const { user, token, dispatch } = useAuthContext()

  // Form States
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmationType, setConfirmationType] = useState(null) // 'name' or 'password'
  const [pendingChanges, setPendingChanges] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : ['', '']
      setFirstName(nameParts[0] || '')
      setLastName(nameParts.slice(1).join(' ') || '')
      setEmail(user.email || '')
    }
  }, [user])

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleSaveClick = (e) => {
    e.preventDefault()
    clearMessages()

    // Validate name change
    if (firstName !== (user?.name?.split(' ')[0] || '') || 
        lastName !== (user?.name?.split(' ').slice(1).join(' ') || '')) {
      
      if (!firstName.trim() || !lastName.trim()) {
        setError('First name and last name are required')
        return
      }

      const newFullName = `${firstName} ${lastName}`
      setPendingChanges({
        type: 'name',
        newValue: newFullName,
        oldValue: user?.name
      })
      setConfirmationType('name')
      setShowConfirmModal(true)
      return
    }

    // Validate password change
    if (password.trim() || confirmPassword.trim()) {
      if (!password.trim() || !confirmPassword.trim()) {
        setError('Both password fields are required')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long')
        return
      }

      setPendingChanges({
        type: 'password',
        newValue: password
      })
      setConfirmationType('password')
      setShowConfirmModal(true)
      return
    }

    setError('No changes to save')
  }

  const handleConfirmChange = async () => {
    if (!pendingChanges || !user) return

    setModalLoading(true)

    try {
      // Get user ID - try different possible formats
      const userId = user.id || user._id || user.userId
      
      if (!userId) {
        throw new Error('User ID not found. Please logout and login again.')
      }

      const endpoint = pendingChanges.type === 'name' 
        ? `${API_BASE_URL}/api/user/${userId}/profile/name`
        : `${API_BASE_URL}/api/user/${userId}/profile/password`

      // Send newPassword and confirmPassword for password updates
      const body = pendingChanges.type === 'name'
        ? { name: pendingChanges.newValue }
        : { 
            newPassword: pendingChanges.newValue,
            confirmPassword: pendingChanges.newValue
          }

      console.log('🔵 Update Request:')
      console.log('  Type:', pendingChanges.type)
      console.log('  Endpoint:', endpoint)
      console.log('  User ID:', userId)
      console.log('  User object:', user)
      console.log('  Token exists:', !!token)
      console.log('  Body:', body)

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      console.log('📥 Response received:')
      console.log('  Status:', response.status)
      console.log('  OK:', response.ok)

      const data = await response.json()
      console.log('  Response data:', data)

      if (!response.ok) {
        console.log('❌ Error response:', data)
        throw new Error(data.message || data.error || `Failed to update ${pendingChanges.type}`)
      }

      console.log('✅ Update successful:', data)

      // Show success message
      setSuccess(`${pendingChanges.type === 'name' ? 'Name' : 'Password'} updated successfully!`)
      
      // Clear modal and form
      setShowConfirmModal(false)
      setPendingChanges(null)

      // Auto logout after 2 seconds
      setTimeout(() => {
        setPassword('')
        setConfirmPassword('')
        
        // Dispatch logout action
        dispatch({ type: 'LOGOUT' })
        
        // Redirect to login
        navigate('/login', { replace: true })
      }, 2000)

    } catch (err) {
      console.error('❌ Error updating profile:', err)
      setError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setModalLoading(false)
    }
  }

  const handleCancelModal = () => {
    setShowConfirmModal(false)
    setPendingChanges(null)
    setConfirmationType(null)
  }

  // =====================================================
  // CONFIRMATION MODAL COMPONENT
  // =====================================================
  const ConfirmationModal = ({ isOpen, type, pendingData }) => {
    if (!isOpen) return null

    const isNameChange = type === 'name'

    return (
      <div className="modal-overlay">
        <div className="modal-content settings-modal">
          <div className="modal-header">
            <h2>Confirm {isNameChange ? 'Name' : 'Password'} Change</h2>
            <button 
              className="modal-close" 
              onClick={handleCancelModal}
              disabled={modalLoading}
            >
              ×
            </button>
          </div>

          <div className="modal-body">
            {isNameChange ? (
              <div className="change-details">
                <p className="modal-message">
                  Are you sure you want to change your name from <strong>{pendingData?.oldValue}</strong> to <strong>{pendingData?.newValue}</strong>?
                </p>
              </div>
            ) : (
              <div className="change-details">
                <p className="modal-message">
                  Are you sure you want to change your password?
                </p>
                <p className="modal-warning">
                  ⚠️ You will be logged out immediately after this change and will need to login again with your new password.
                </p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button 
              className="modal-btn modal-btn-cancel" 
              onClick={handleCancelModal}
              disabled={modalLoading}
            >
              Cancel
            </button>
            <button 
              className="modal-btn modal-btn-confirm" 
              onClick={handleConfirmChange}
              disabled={modalLoading}
            >
              {modalLoading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-container">
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmModal} 
        type={confirmationType}
        pendingData={pendingChanges}
      />

      <div className="settings-content">
        <div className="settings-header">
          <h1>Settings</h1>
          <p className="settings-subtitle">Manage your profile and account settings</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">✕</span>
            <span className="alert-message">{error}</span>
            <button 
              className="alert-close" 
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <span className="alert-message">{success}</span>
            <button 
              className="alert-close" 
              onClick={() => setSuccess('')}
            >
              ×
            </button>
          </div>
        )}

        {/* Edit Profile Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Edit Profile</h2>
          </div>

          <form className="settings-form" onSubmit={handleSaveClick}>
            {/* First Name */}
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>

            {/* Email (Non-editable) */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-input disabled"
                value={email}
                disabled
                title="Email cannot be changed"
              />
              <span className="form-helper">Email cannot be changed</span>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (leave blank to keep current)"
              />
              <span className="form-helper">Minimum 8 characters</span>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            {/* Warning Message */}
            {(password.trim() || confirmPassword.trim()) && (
              <div className="form-warning">
                <span className="warning-icon">⚠️</span>
                <span>User will be logged out immediately after password change</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={modalLoading}
              >
                {modalLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Settings