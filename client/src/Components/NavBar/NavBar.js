import "./NavBarStyles.css";
import { Link } from "react-router-dom";
import appLogo from "../../Assets/CommonAssets/appLogo.png";
import { useLogout } from "../../Hooks/useLogout";
import { useAuthContext } from "../../Hooks/useAuthContext";

const NavBar = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();

  return (
    <nav className="navbar">

      <div className="navbar-left">
        <Link to="/">
          <img src={appLogo} alt="App Logo" className="logo-image" />
        </Link>
      </div>


      <div className="navbar-right">
        {user ? (
          <>
            <span className="username">{user?.name ?? user?.email}</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/Login" className="login-text">Login</Link>
            <Link to="/SignUp" className="signup-btn">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
