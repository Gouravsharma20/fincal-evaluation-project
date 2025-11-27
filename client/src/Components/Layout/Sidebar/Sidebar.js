import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
// import { useAuthContext } from '../../../Hooks/useAuthContext'
import './SidebarStyles.css'

// Import your custom assets
import HomeIcon from '../../../Assets/SideBarAssets/DashBoard.png'
import ChatBoxIcon from '../../../Assets//SideBarAssets/ChatBox.png'
import AnalyticsIcon from '../../../Assets//SideBarAssets/Analytics.png'
import TeamMemberIcon from '../../../Assets/SideBarAssets/TeamMembers.png'
import HomePageSettingIcon from '../../../Assets//SideBarAssets/HomePageSetting.png'
import SettingIcon from '../../../Assets//SideBarAssets/Setting.png'
import AppLogo from '../../../Assets/CommonAssets/appLogo.png'

const Sidebar = ({ userRole = 'team_member', openTicket = null }) => {
  const navigate = useNavigate()
  const location = useLocation()
  // const { user } = useAuthContext()

  // Navigation configuration with custom icons
  const getNavItems = () => {
    const commonItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: HomeIcon,
        tooltip: 'Dashboard'
      },
      {
        id: 'messages',
        label: 'Messages',
        path: '/messages',
        icon: ChatBoxIcon,
        tooltip: 'Chat & Messages'
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: SettingIcon,
        tooltip: 'Settings'
      }
    ]

    const adminOnlyItems = [
      {
        id: 'analytics',
        label: 'Analytics',
        path: '/analytics',
        icon: AnalyticsIcon,
        tooltip: 'Analytics & Reports'
      },
      {
        id: 'team',
        label: 'Team',
        path: '/team-management',
        icon: TeamMemberIcon,
        tooltip: 'Team Management'
      },
      {
        id: 'ui-settings',
        label: 'UI Settings',
        path: '/ui-settings',
        icon: HomePageSettingIcon,
        tooltip: 'UI Settings'
      }
    ]

    if (userRole === 'admin') {
      return [
        commonItems[0],
        commonItems[1],
        ...adminOnlyItems,
        commonItems[2]
      ]
    } else {
      return commonItems
    }
  }

  const navItems = getNavItems()
  const isActive = (path) => location.pathname === path

  const mainItems = navItems.filter(item => item.id !== 'settings')
  const settingsItem = navItems.find(item => item.id === 'settings')




  return (
    <div className="sidebar-container">
      {/* Logo Section */}
      <div className="sidebar-top">
        <div className="logo-section">
          <img src={AppLogo} alt="App Logo" className="logo-icon" />
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="sidebar-nav">
        {mainItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => {
              navigate(item.path)
            }}
            title={item.tooltip}
          >
            <img
              src={item.icon}
              alt={item.label}
              className="nav-icon-image"
            />
            <span className="nav-tooltip">{item.tooltip}</span>
          </button>
        ))}
      </nav>

      {/* Settings at Bottom */}
      {settingsItem && (
        <div className="sidebar-bottom">
          <button
            className={`nav-item ${isActive(settingsItem.path) ? 'active' : ''}`}
            onClick={() => navigate(settingsItem.path)}
            title={settingsItem.tooltip}
          >
            <img
              src={settingsItem.icon}
              alt={settingsItem.label}
              className="nav-icon-image"
            />
            <span className="nav-tooltip">{settingsItem.tooltip}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Sidebar