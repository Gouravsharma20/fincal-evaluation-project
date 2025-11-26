import React from 'react'
import { useAuthContext } from '../../Hooks/useAuthContext'
import './TeamManagementStyles.css'

const TeamManagement = () => {
  const { user } = useAuthContext()

  if (!user || user.role !== 'admin') {
    return <div className="unauthorized">Admin access only</div>
  }

  return (
    <div className="blank-page">
      <div className="blank-page-container">
        <div className="blank-icon">👥</div>
        <h1>Team Management</h1>
        <p>Coming soon...</p>
      </div>
    </div>
  )
}

export default TeamManagement