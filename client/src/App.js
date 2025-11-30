import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useContext } from "react";
import Home from './Pages/Home/Home.js';
import NavBar from './Components/NavBar/NavBar.js';
import SignUp from './Pages/SignUp/SignUp.js';
import Login from './Pages/Login/Login.js';
import Team from './Pages/Team/Team.js';
import AuthContextProvider, { AuthContext } from './Context/AuthContext.js';
import Dashboard from "./Pages/Dashboard/Dashboard.js"
import Messages from './Pages/Messages/Messages.js';
import Analytics from './Pages/Analytics/Analytics.js';
import TeamManagement from './Pages/TeamManagement/TeamManagement.js';
import UISettings from './Pages/UISettings/UISettings.js';
import Settings from './Pages/Settings/Settings.js';

import Sidebar from './Components/Layout/Sidebar/Sidebar.js';






function AppContent() {
  const { user, loading } = useContext(AuthContext);   //token was also there [removed because of warning]

  if (loading) {
    return <div className="App"><p>Loading...</p></div>;
  }

  return (
    <div className="App">
      {!user ? (
        <>
          {/* NavBar MUST be outside <Routes> */}
          <NavBar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
      ) : user.isAdmin ? (
        <div className="app-layout">
          <Sidebar userRole="admin" />
          <div className='app-main'>
            {/* <NavBar/> */}
            <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/team-management" element={<TeamManagement />} />
            <Route path="/ui-settings" element={<UISettings />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
          </div>
        </div>
      ) : (
        <div className="app-layout">
          <Sidebar />
          <div className='app-main'>
            <NavBar/>
            <Routes>
            <Route path="/team" element={<Team />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/team/*" element={<Team />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="/team" />} />
            <Route path="*" element={<Navigate to="/team" />} />
          </Routes>
          </div>
          
        </div>
      )}
    </div>
  );
}


function App() {
    return (
        <AuthContextProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthContextProvider>
    );
}

export default App;

