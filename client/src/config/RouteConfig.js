// src/config/routeConfig.js
// ==========================================
// ZERO LOGIC CHANGES - Just organizing routes
// These are the EXACT same routes from your App.js
// ==========================================

import Home from '../Pages/Home/Home'
import Login from '../Pages/Auth/Login/Login'
import SignUp from '../Pages/Auth/SignUp/SignUp'
import Dashboard from '../Pages/DashBoard/Dashboard'
import Messages from '../Pages/Messages/Messages'
import Analytics from '../Pages/Analytics/Analytics'
import TeamManagement from '../Pages/TeamManagement/TeamManagement'
import UISettings from '../Pages/UISettings/UISettings'
import Settings from '../Pages/Settings/Settings'

export const PUBLIC_ROUTES = [
  { path: '/', element: Home },
  { path: '/signup', element: SignUp },
  { path: '/login', element: Login }
]


export const ADMIN_ROUTES = [
  { path: '/dashboard', element: Dashboard },
  { path: '/messages', element: Messages },
  { path: '/analytics', element: Analytics },
  { path: '/team-management', element: TeamManagement },
  { path: '/ui-settings', element: UISettings },
  { path: '/settings', element: Settings }
]


export const TEAM_ROUTES = [
  // { path: '/team/*', element: Team },
  { path: '/settings', element: Settings }
]