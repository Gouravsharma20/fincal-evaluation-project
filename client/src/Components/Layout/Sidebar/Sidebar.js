import { useNavigate, useLocation } from 'react-router-dom'
import './SidebarStyles.css'

import HomeIcon from '../../../Assets/SideBarAssets/DashBoard.png'
import ChatBoxIcon from '../../../Assets/SideBarAssets/ChatBoxy.png'
import AnalyticsIcon from '../../../Assets/SideBarAssets/Analytics.png'
import TeamMemberIcon from '../../../Assets/SideBarAssets/TeamMembers.png'
import HomePageSettingIcon from '../../../Assets/SideBarAssets/HomePageSetting.png'
import SettingIcon from '../../../Assets/SideBarAssets/Setting.png'
import AppLogo from '../../../Assets/SideBarAssets/SidebarLogo.png'
import ProfileIcon from '../../../Assets/SideBarAssets/ProfileIcon.png'

const Sidebar = ({ userRole = 'team_member' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const getNavItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: HomeIcon },
      { id: 'messages', label: 'Messages', path: '/messages', icon: ChatBoxIcon },
      { id: 'settings', label: 'Settings', path: '/settings', icon: SettingIcon },
    ]

    const adminOnlyItems = [
      { id: 'analytics', label: 'Analytics', path: '/analytics', icon: AnalyticsIcon },
      { id: 'team', label: 'Team', path: '/team-management', icon: TeamMemberIcon },
      { id: 'ui-settings', label: 'UI Settings', path: '/ui-settings', icon: HomePageSettingIcon }
    ]

    if (userRole === 'admin') {
      return [
        commonItems[0],  
        commonItems[1],  
        ...adminOnlyItems,
        commonItems[2]   
      ]
    }

  
    return commonItems
  }

  const navItems = getNavItems()
  const isActive = (path) => location.pathname === path

  const mainItems = navItems
  const settingsItem = navItems.find(i => i.id === 'settings')

  return (
    <div className="sidebar-wrapper">

      <div className="sidebar-logo">
        <img src={AppLogo} alt="App Logo" />
      </div>

      <div className="sidebar-nav">
        {mainItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-btn ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <img src={item.icon} alt={item.label} className="icon" />
            <span className="label">{item.label}</span>
          </button>
        ))}
      </div>


  
      {settingsItem && (
        <div className="sidebar-bottom">
          <img
            src={ProfileIcon} 
            alt="Profile"
            className="nav-icon-image"
          />
        </div>
      )}

    </div>
  )
}

export default Sidebar
