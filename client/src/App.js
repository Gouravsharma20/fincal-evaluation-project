import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useContext } from "react";
import Home from './Pages/Home/Home';
import NavBar from './Components/NavBar/NavBar';
import SignUp from './Pages/SignUo/SignUp';
import Login from './Pages/Login/Login';
import Admin from './Pages/Admin/Admin';
import Team from './Pages/Team/Team';
import AuthContextProvider, { AuthContext } from './Context/AuthContext';

function AppContent() {
    const { user,token,loading } = useContext(AuthContext);

    console.log('🔵 [APP] Rendering AppContent');
    console.log('   user:', user);
    console.log('   token:', token);
    console.log('   user?.isAdmin:', user?.isAdmin);

    if (loading) {
        return <div className="App"><p>Loading...</p></div>;
    }
    
    return (
        <div className="App">
            <Router>
                <NavBar />
                
                {!user ? (
                    // Not logged in - show login/signup/home
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                ) : user.isAdmin ? (
                    // Admin logged in - show admin routes only
                    <Routes>
                      <Route path="/dashboard" element={<Admin />} />
                        <Route path="/messages" element={<Admin />} />
                        <Route path="/analytics" element={<Admin />} />
                        <Route path="/team-management" element={<Admin />} />
                        <Route path="/ui-settings" element={<Admin />} />
                        <Route path="/settings" element={<Admin />} />


                        <Route path="/admin/*" element={<Admin />} />

                        
                        <Route path="/" element={<Navigate to="/admin" />} />
                        <Route path="*" element={<Navigate to="/admin" />} />
                    </Routes>
                ) : (
                    // Regular user logged in - show team routes only
                    <Routes>
                        <Route path="/team/*" element={<Team />} />
                        <Route path="/" element={<Navigate to="/team" />} />
                        <Route path="*" element={<Navigate to="/team" />} />
                    </Routes>
                )}
            </Router>
        </div>
    );
}

function App() {
    return (
        <AuthContextProvider>
            <AppContent />
        </AuthContextProvider>
    );
}

export default App;


