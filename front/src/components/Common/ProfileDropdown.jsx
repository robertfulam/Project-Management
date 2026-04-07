import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import "./ProfileDropdown.css";

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [bgImage, setBgImage] = useState("");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState("user"); // 'user' or 'admin'
  const [loading, setLoading] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    
    // Detect current view from URL
    const path = window.location.pathname;
    setCurrentView(path.includes('/admin') ? 'admin' : 'user');
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadUser = () => {
    const userData = authService.getUser();
    const userRole = authService.getUserRole();
    setUser(userData);
    setIsAdmin(userRole === 'admin');
  };

  const toggleDropdown = () => setOpen(!open);

  const handleLogout = () => {
    setOpen(false);
    authService.logout();
  };

  const switchToUserView = async () => {
    setSwitchLoading(true);
    try {
      setCurrentView('user');
      setOpen(false);
      navigate('/');
      // Small delay to ensure navigation completes
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Failed to switch to user view:', error);
    } finally {
      setSwitchLoading(false);
    }
  };

  const switchToAdminView = async () => {
    setSwitchLoading(true);
    try {
      setCurrentView('admin');
      setOpen(false);
      navigate('/admin');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Failed to switch to admin view:', error);
    } finally {
      setSwitchLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      localStorage.setItem('userProfileImage', imageUrl);
    }
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBgImage(imageUrl);
      localStorage.setItem('userBackground', imageUrl);
      window.dispatchEvent(new CustomEvent('backgroundChanged', { detail: imageUrl }));
    }
  };

  const generateAIBg = async () => {
    setLoading(true);
    try {
      const randomId = Math.floor(Math.random() * 1000);
      const aiBgUrl = `https://picsum.photos/id/${randomId}/1920/1080`;
      
      setBgImage(aiBgUrl);
      localStorage.setItem('userBackground', aiBgUrl);
      window.dispatchEvent(new CustomEvent('backgroundChanged', { detail: aiBgUrl }));
    } catch (error) {
      console.error('Failed to generate AI background:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBackground = () => {
    setBgImage('');
    localStorage.removeItem('userBackground');
    window.dispatchEvent(new CustomEvent('backgroundChanged', { detail: '' }));
  };

  const redirectAuth = (path) => {
    setOpen(false);
    navigate(path);
  };

  if (!user) {
    return (
      <div className="profile-dropdown-container" ref={dropdownRef}>
        <div className="profile-trigger" onClick={toggleDropdown}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
            alt="Profile"
            className="profile-avatar"
          />
          <span className="profile-name">Guest</span>
        </div>

        {open && (
          <div className="profile-dropdown-menu">
            <div className="dropdown-section" onClick={() => redirectAuth("/login")}>
              <div className="dropdown-title">🔐 Login</div>
            </div>
            <div className="dropdown-section" onClick={() => redirectAuth("/signup")}>
              <div className="dropdown-title">📝 Sign Up</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <div className="profile-trigger" onClick={toggleDropdown}>
        <img
          src={
            profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&bold=true`
          }
          alt="Profile"
          className="profile-avatar"
        />
        <span className="profile-name">{user.name}</span>
        <span className={`role-indicator ${currentView}`}>
          {currentView === 'admin' ? '👑' : '👤'}
        </span>
      </div>

      {open && (
        <div className="profile-dropdown-menu">
          {/* User Info Header */}
          <div className="dropdown-user-header">
            <div className="user-header-avatar">
              <img
                src={
                  profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&bold=true`
                }
                alt={user.name}
              />
            </div>
            <div className="user-header-info">
              <div className="user-header-name">{user.name}</div>
              <div className="user-header-email">{user.email}</div>
              <div className={`user-header-role ${user.role}`}>
                {user.role === 'admin' ? 'Administrator' : 'Regular User'}
              </div>
              <div className="current-view-badge">
                Currently viewing: <strong>{currentView === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}</strong>
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* DASHBOARD SWITCH SECTION - For admin users to switch between views */}
          {isAdmin && (
            <>
              <div className="role-switch-section">
                <div className="role-switch-header">
                  <span className="role-switch-icon">🔄</span>
                  <span className="role-switch-title">Switch Dashboard View</span>
                </div>
                <div className="role-switch-options">
                  <button 
                    className={`role-option ${currentView === 'user' ? 'active' : ''}`}
                    onClick={switchToUserView}
                    disabled={switchLoading || currentView === 'user'}
                  >
                    <span className="role-option-icon">👤</span>
                    <div className="role-option-info">
                      <div className="role-option-name">User Dashboard</div>
                      <div className="role-option-desc">View as regular user</div>
                    </div>
                    {currentView === 'user' && <span className="role-active-badge">Current</span>}
                  </button>
                  
                  <button 
                    className={`role-option ${currentView === 'admin' ? 'active' : ''}`}
                    onClick={switchToAdminView}
                    disabled={switchLoading || currentView === 'admin'}
                  >
                    <span className="role-option-icon">👑</span>
                    <div className="role-option-info">
                      <div className="role-option-name">Admin Dashboard</div>
                      <div className="role-option-desc">Full administrative control</div>
                    </div>
                    {currentView === 'admin' && <span className="role-active-badge">Current</span>}
                  </button>
                </div>
                {switchLoading && (
                  <div className="role-switch-loading">
                    <span className="spinner"></span>
                    Switching dashboard...
                  </div>
                )}
              </div>
              <div className="dropdown-divider"></div>
            </>
          )}

          {/* Profile Section - Always visible */}
          <div className="dropdown-section hover-section">
            <div className="dropdown-title">
              <span className="dropdown-icon">👤</span>
              Profile Details
            </div>
            <div className="floating-submenu">
              <div className="submenu-item">
                <strong>Name:</strong> {user.name}
              </div>
              <div className="submenu-item">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="submenu-item">
                <strong>Account Type:</strong> 
                <span className={`role-badge ${user.role}`}>
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>
              <div className="submenu-item">
                <strong>Joined:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
              </div>
            </div>
          </div>

          {/* Settings Section - Always visible */}
          <div className="dropdown-section hover-section">
            <div className="dropdown-title">
              <span className="dropdown-icon">⚙️</span>
              Settings
            </div>
            <div className="floating-submenu">
              <div className="bg-upload">
                <label className="upload-label">Change Avatar:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="file-input"
                />
              </div>
              <div className="bg-upload">
                <label className="upload-label">Upload Background:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleBgUpload}
                  className="file-input"
                />
              </div>
              <button 
                className="ai-bg-btn" 
                onClick={generateAIBg}
                disabled={loading}
              >
                {loading ? '⏳ Generating...' : '🎨 Generate AI Background'}
              </button>
              {bgImage && (
                <div className="bg-preview-container">
                  <img src={bgImage} alt="Background Preview" className="bg-preview" />
                  <button onClick={removeBackground} className="remove-bg-btn" title="Remove background">
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Actions - Always visible */}
          <div className="dropdown-section hover-section">
            <div className="dropdown-title">
              <span className="dropdown-icon">🔧</span>
              Account
            </div>
            <div className="floating-submenu">
              <button className="account-action-btn" onClick={() => redirectAuth('/change-password')}>
                🔑 Change Password
              </button>
              <button className="account-action-btn danger" onClick={() => redirectAuth('/settings')}>
                ⚙️ Account Settings
              </button>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* Logout - Always visible */}
          <div className="dropdown-section">
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;