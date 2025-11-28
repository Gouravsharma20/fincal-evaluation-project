import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useContext } from "react";
import Home from './Pages/Home/Home';
import NavBar from './Components/NavBar/NavBar';
import SignUp from './Pages/SignUp/SignUp';
import Login from './Pages/Login/Login';
import Team from './Pages/Team/Team';
import AuthContextProvider, { AuthContext } from './Context/AuthContext';
import Dashboard from "./Pages/Dashboard/Dashboard"
import Messages from './Pages/Messages/Messages';
import Analytics from './Pages/Analytics/Analytics';
import TeamManagement from './Pages/TeamManagement/TeamManagement';
import UISettings from './Pages/UISettings/UISettings';
import Settings from './Pages/Settings/Settings';

import Sidebar from './Components/Layout/Sidebar/Sidebar';






function AppContent() {
    const { user, token, loading } = useContext(AuthContext);

    console.log('🔵 [APP] Rendering AppContent');
    console.log('   user:', user);
    console.log('   token:', token);
    console.log('   user?.isAdmin:', user?.isAdmin);

    if (loading) {
        return <div className="App"><p>Loading...</p></div>;
    }

    return (
        <div className="App">
            <NavBar />

            {!user ? (
                // Not logged in - show login/signup/home
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            ) : user.isAdmin ? (
                <>
                    <Sidebar userRole="admin" />
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/team-management" element={<TeamManagement />} />
                        <Route path="/ui-settings" element={<UISettings />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/dashboard/*" element={<Dashboard />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </>
            ) : (
                <>
                    <Sidebar />
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/team/*" element={<Team />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/dashboard/*" element={<Dashboard />} />
                        <Route path="/" element={<Navigate to="/team" />} />
                        <Route path="*" element={<Navigate to="/team" />} />
                    </Routes>
                </>

            )
            }
        </div >
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

