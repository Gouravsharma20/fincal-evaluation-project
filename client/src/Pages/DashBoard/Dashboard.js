import React from 'react'
import DashboardLayout from '../../Components/DashboardLayout/DashBoard'
import { useAuthContext } from '../../Hooks/useAuthContext'

const Dashboard = () => {
  const { user, token } = useAuthContext()

  if (!token || !user) {
    return <div className="unauthorized">Please log in</div>
  }

  return <DashboardLayout userRole={user.role} />
}

export default Dashboard