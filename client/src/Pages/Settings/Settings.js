import React, { useState } from 'react'
import PasswordSettings from '../../Components/PasswordSettings/PaaswordSettings'
import { useAuthContext } from '../../Hooks/useAuthContext'
import './SettingsStyles.css'

const Settings = () => {
  const { user, token } = useAuthContext()
  const [activeTab, setActiveTab] = useState('password')

  if (!user || !token) {
    return (
      <div className="blank-page">
        <div className="blank-page-container">
          <p>Please log in to access settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="settings-title">
            <h1>Settings</h1>
            <p className="user-name">{user.name || user.email}</p>
          </div>

          <nav className="settings-nav">
            <button
              className={`settings-nav-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              🔐 Password
            </button>

            {user.role === 'admin' && (
              <button
                className={`settings-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                ⚙️ Admin Settings
              </button>
            )}
          </nav>
        </div>

        <div className="settings-content">
          {activeTab === 'password' && (
            <PasswordSettings
              userId={user._id || user.id}
              userRole={user.role}
            />
          )}

          {activeTab === 'admin' && user.role === 'admin' && (
            <div className="settings-placeholder">
              <h2>Admin Settings</h2>
              <p>Coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings