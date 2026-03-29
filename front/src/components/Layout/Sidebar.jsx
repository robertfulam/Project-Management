import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiCheckSquare, 
  FiFolder, 
  FiClock, 
  FiCheckCircle, 
  FiTrendingUp,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiCpu,
  FiUpload,
  FiBarChart2
} from 'react-icons/fi';
import { authService } from '../services/authService';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, onToggle }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAdmin(authService.isAdmin());
    setUser(authService.getUser());
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const userLinks = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/add', icon: FiCheckSquare, label: 'Add Task' },
    { path: '/categories', icon: FiFolder, label: 'Categories' },
    { path: '/pending', icon: FiClock, label: 'Pending' },
    { path: '/complete', icon: FiCheckCircle, label: 'Complete' },
    { path: '/progress', icon: FiTrendingUp, label: 'Progress' },
  ];

  const adminLinks = [
    { path: '/admin', icon: FiHome, label: 'Admin Dashboard' },
    { path: '/admin/progress', icon: FiBarChart2, label: 'Progress Overview' },
    { path: '/admin/tasks', icon: FiCheckSquare, label: 'All Tasks' },
    { path: '/admin/categories', icon: FiFolder, label: 'All Categories' },
    { path: '/admin/pending', icon: FiClock, label: 'All Pending' },
    { path: '/admin/complete', icon: FiCheckCircle, label: 'All Complete' },
    { path: '/admin/users', icon: FiUsers, label: 'User Management' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const currentPath = window.location.pathname;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => navigate(isAdmin ? '/admin' : '/')}>
            <span className="logo-icon">📋</span>
            {isOpen && <span className="logo-text">TaskManager</span>}
          </div>
          <button className="mobile-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* User Info */}
        {user && isOpen && (
          <div className="user-info">
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className={`user-role ${user.role}`}>{user.role}</div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <link.icon className="sidebar-icon" />
              {isOpen && <span className="sidebar-label">{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* AI Assistant Quick Link */}
        {isOpen && (
          <div className="ai-quick-link">
            <div className="ai-header">
              <FiCpu />
              <span>AI Assistant</span>
            </div>
            <p>Ask AI to summarize, monetize, or help with your tasks</p>
          </div>
        )}

        {/* Footer */}
        <div className="sidebar-footer">
          {isOpen && (
            <>
              <button className="footer-link" onClick={() => navigate('/settings')}>
                <FiSettings className="footer-icon" />
                <span>Settings</span>
              </button>
            </>
          )}
          <button className="footer-link logout" onClick={handleLogout}>
            <FiLogOut className="footer-icon" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;