import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Layout/Navbar";
import AdminDashboard from "./components/Admin/AdminDashboard";
import UserDashboard from "./components/User/UserDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./components/Common/ForgotPassword";
import ResetPassword from "./components/Common/ResetPassword";
import { authService } from "./components/services/authService";
import RoleSwitcher from "./components/Common/RoleSwitcher";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/user-dashboard" />;
  }
  
  return children;
};

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAdmin(authService.isAdmin());
    };
    checkAuth();
  }, []);

  return (
    <div className="app">
      <Navbar />
      <RoleSwitcher />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/user-dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={
          <Navigate to={isAdmin ? "/admin-dashboard" : "/user-dashboard"} />
        } />
      </Routes>
    </div>
  );
}

export default App;