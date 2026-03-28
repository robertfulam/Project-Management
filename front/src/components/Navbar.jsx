import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";
import ThemeToggle from "./ThemeToggle";
import ProfileDropdown from "./ProfileDropdown";
import { authService } from "../services/authService";
import { taskService } from "../services/taskService";

function Navbar() {
  const [tasks, setTasks] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      setIsAdmin(authService.isAdmin());
      await fetchTasks();
    }
    setLoading(false);
  };

  const fetchTasks = async () => {
    try {
      if (!authService.isAuthenticated()) return;
      const userTasks = await taskService.getUserTasks();
      setTasks(userTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      // Don't show error in navbar
    }
  };

  // Show minimal navbar while checking auth
  if (loading) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="logo">PM</h2>
          <div className="auth-section">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    );
  }

  // Show login navbar if not authenticated
  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <h2 className="logo" onClick={() => navigate("/login")}>
            PM
          </h2>
          <div className="auth-section">
            <ThemeToggle />
            <ProfileDropdown />
          </div>
        </div>
      </nav>
    );
  }

  // Calculate stats
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const categories = [...new Set(tasks.map(t => t.category?.name).filter(Boolean))];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h2 className="logo" onClick={() => navigate(isAdmin ? "/admin" : "/")}>
          PM
        </h2>

        <div className="nav-links">
          <NavLink to={isAdmin ? "/admin" : "/"} className="nav-link">
            Dashboard
          </NavLink>
          
          <NavLink to="/add" className="nav-link">
            Add Task
          </NavLink>
          
          <NavLink to="/categories" className="nav-link">
            Categories <span className="badge">{categories.length}</span>
          </NavLink>
          
          <NavLink to="/pending" className="nav-link">
            Pending <span className="badge">{pending}</span>
          </NavLink>
          
          <NavLink to="/complete" className="nav-link">
            Complete <span className="badge">{completed}</span>
          </NavLink>
          
          <NavLink to="/progress" className="nav-link">
            Progress <span className="badge">{completionRate}%</span>
          </NavLink>
          
          {isAdmin && (
            <NavLink to="/admin" className="nav-link admin-link">
              Admin Panel
            </NavLink>
          )}
        </div>

        <div className="auth-section">
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;