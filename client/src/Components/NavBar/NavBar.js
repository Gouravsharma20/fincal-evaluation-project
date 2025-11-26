import React from 'react'
import "./NavBarStyles.css"
import { Link } from 'react-router-dom'
import appLogo from "../../Assets/CommonAssets/appLogo.png"
import { useLogout } from "../../Hooks/useLogout"
import { useAuthContext } from '../../Hooks/useAuthContext'

const NavBar = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const handleClick = () => {
    logout();
  }
  return (
    <nav>
      <div className='logo'>
        <Link to="/">
          <img src={appLogo} alt="App Logo" className='logo-image' />
        </Link>
        {user && (
          <div className='logout'>
            <span>{user?.name ?? user?.email ?? "Unknown user {test}"}</span>
            <button onClick={handleClick}>logout</button>
          </div>
        )}
      </div>
      {!user && (
        <div className='auth'>
        <Link to="/SignUp">SignUp</Link>
        <Link to="/Login">Login</Link>
      </div>
      )}
    </nav>
  )
}

export default NavBar