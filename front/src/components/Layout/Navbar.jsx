import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import ThemeToggle from '../ThemeToggle';
import ProfileDropdown from '../Common/ProfileDropdown';
import './Navbar.css';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setUser(authService.getUser());
      }
    };
    checkAuth();
  }, []);

  const handleLogoClick = () => {
    if (isAuthenticated) {
      const isAdmin = authService.isAdmin();
      navigate(isAdmin ? '/admin-dashboard' : '/user-dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo" onClick={handleLogoClick}>
          TaskManager
        </div>

        {isAuthenticated && (
          <div className="nav-links">
            <Link to={authService.isAdmin() ? '/admin-dashboard' : '/user-dashboard'} className="nav-link">
              Dashboard
            </Link>
            {!authService.isAdmin() && (
              <>
                <Link to="/user-dashboard?tab=tasks" className="nav-link">My Tasks</Link>
                <Link to="/user-dashboard?tab=categories" className="nav-link">Categories</Link>
              </>
            )}
          </div>
        )}

        <div className="nav-right">
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;