import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AddTask from "./pages/AddTask";
import EditTask from "./pages/EditTask";
import TaskDetails from "./pages/TaskDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Complete from "./components/Complete";
import Pending from "./components/Pending";
import Categories from "./components/Categories";
import Admin from "./pages/Admin";
import UserProgress from "./components/UserProgress";
import AdminProgress from "./components/AdminProgress";
import { authService } from "./services/authService";

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const role = authService.getUserRole();
      setIsAuthenticated(authenticated);
      setUserRole(role);
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="loading-spinner">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const userData = authService.getUser();
      const userRole = authService.getUserRole();
      setUser(userData);
      setIsAdmin(userRole === 'admin');
    };
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <div className="app">
      <Navbar />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected User Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/add" element={
          <ProtectedRoute>
            <AddTask />
          </ProtectedRoute>
        } />
        <Route path="/complete" element={
          <ProtectedRoute>
            <Complete />
          </ProtectedRoute>
        } />
        <Route path="/pending" element={
          <ProtectedRoute>
            <Pending />
          </ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        } />
        <Route path="/progress" element={
          <ProtectedRoute>
            <UserProgress />
          </ProtectedRoute>
        } />
        <Route path="/edit/:id" element={
          <ProtectedRoute>
            <EditTask />
          </ProtectedRoute>
        } />
        <Route path="/task/:id" element={
          <ProtectedRoute>
            <TaskDetails />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/admin/progress" element={
          <ProtectedRoute requireAdmin>
            <AdminProgress />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;