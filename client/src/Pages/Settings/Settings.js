
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../Hooks/useAuthContext'
import './SettingsStyles.css'
import { API_BASE_URL } from '../../config/api'

const Settings = () => {
  const navigate = useNavigate()
  const { user, token, dispatch } = useAuthContext()


  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')


  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmationType, setConfirmationType] = useState(null)
  const [pendingChanges, setPendingChanges] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)


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
      const userId = user.id || user._id || user.userId

      if (!userId) {
        throw new Error('User ID not found. Please logout and login again.')
      }

      const endpoint = pendingChanges.type === 'name'
        ? `${API_BASE_URL}/api/user/${userId}/profile/name`
        : `${API_BASE_URL}/api/user/${userId}/profile/password`

      const body = pendingChanges.type === 'name'
        ? { name: pendingChanges.newValue }
        : {
          newPassword: pendingChanges.newValue,
          confirmPassword: pendingChanges.newValue
        }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })


      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || `Failed to update ${pendingChanges.type}`)
      }


      setSuccess(`${pendingChanges.type === 'name' ? 'Name' : 'Password'} updated successfully!`)


      setShowConfirmModal(false)
      setPendingChanges(null)

      if (pendingChanges.type === 'password') {
        setTimeout(() => {
          setPassword('')
          setConfirmPassword('')


          dispatch({ type: 'LOGOUT' })


          navigate('/login', { replace: true })
        }, 2000)

      } else {
        setTimeout(() => {
          setSuccess('')
        }, 3000)
      }


    } catch (err) {
      console.error('Error updating profile:', err)
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
                  You will be logged out immediately after this change and will need to login again with your new password.
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
      <ConfirmationModal
        isOpen={showConfirmModal}
        type={confirmationType}
        pendingData={pendingChanges}
      />

      <div className="settings-content">
        <div className="settings-header">
          <h1>Settings</h1>
        </div>

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

        <div className="settings-section">
          <div className="section-header">
            <h2>Edit Profile</h2>
          </div>

          <form className="settings-form" onSubmit={handleSaveClick}>
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First name
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

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last name
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

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="input-with-info">
                <input
                  type="email"
                  id="email"
                  className="form-input disabled"
                  value={email}
                  disabled
                  title="Email cannot be changed"
                />
                <div className="info-icon" data-tooltip="Email cannot be changed">
                  <span>i</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-with-info">
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="************"
                />
                <div className="info-icon" data-tooltip="Minimum 8 characters">
                  <span>i</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-with-info">
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="************"
                />
                <div className="info-icon" data-tooltip="User will logged out immediately">
                  <span>i</span>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={modalLoading}
              >
                {modalLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Settings