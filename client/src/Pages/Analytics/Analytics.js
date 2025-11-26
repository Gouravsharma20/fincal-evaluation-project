import React from 'react'
import { useAuthContext } from '../../Hooks/useAuthContext'
import './AnalyticsStyles.css'

const Analytics = () => {
  const { user } = useAuthContext()

  if (!user || user.role !== 'admin') {
    return <div className="unauthorized">Admin access only</div>
  }

  return (
    <div className="blank-page">
      <div className="blank-page-container">
        <div className="blank-icon">📊</div>
        <h1>Analytics & Reports</h1>
        <p>Coming soon...</p>
      </div>
    </div>
  )
}

export default Analytics