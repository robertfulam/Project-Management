import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "./services/authService";
import "./ProfileDropdown.css";

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [bgImage, setBgImage] = useState("");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = () => {
    const userData = authService.getUser();
    const userRole = authService.getUserRole();
    setUser(userData);
    setIsAdmin(userRole === 'admin');
  };

  const toggleDropdown = () => setOpen(!open);

  const handleLogout = () => {
    authService.logout();
  };

  const handleSwitchRole = async () => {
    try {
      await authService.switchRole();
      // Reload user data
      const userData = await authService.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);
      loadUser();
      
      // Navigate to appropriate dashboard
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to switch role:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) setBgImage(URL.createObjectURL(file));
  };

  const generateAIBg = () => {
    const aiBgUrl = `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/400/100`;
    setBgImage(aiBgUrl);
  };

  const redirectAuth = (path) => navigate(path);

  if (!user) {
    return (
      <div className="profile-dropdown-container">
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
              <div>Login</div>
            </div>
            <div className="dropdown-section" onClick={() => redirectAuth("/signup")}>
              <div>Signup</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="profile-dropdown-container">
      <div className="profile-trigger" onClick={toggleDropdown}>
        <img
          src={
            profileImage ||
            `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`
          }
          alt="Profile"
          className="profile-avatar"
        />
        <span className="profile-name">{user.name}</span>
      </div>

      {open && (
        <div className="profile-dropdown-menu">
          {/* Profile Section */}
          <div className="dropdown-section hover-section">
            <div className="dropdown-title">👤 Profile</div>
            <div className="floating-submenu">
              <div><strong>Name:</strong> {user.name}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Role:</strong> {user.role}</div>
            </div>
          </div>

          {/* Role Switch (Admin only) */}
          {isAdmin && (
            <div className="dropdown-section hover-section">
              <div className="dropdown-title">🔄 Switch Mode</div>
              <div className="floating-submenu">
                <button className="switch-role-btn" onClick={handleSwitchRole}>
                  Switch to {user.role === 'admin' ? 'User' : 'Admin'} Mode
                </button>
                <small className="role-hint">Click to change dashboard view</small>
              </div>
            </div>
          )}

          {/* Settings Section */}
          <div className="dropdown-section hover-section">
            <div className="dropdown-title">⚙️ Settings</div>
            <div className="floating-submenu">
              <div className="bg-upload">
                <label>Change Avatar:</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </div>
              <div className="bg-upload">
                <label>Upload Background:</label>
                <input type="file" accept="image/*" onChange={handleBgUpload} />
              </div>
              <button className="ai-bg-btn" onClick={generateAIBg}>
                Generate AI Background
              </button>
              {bgImage && (
                <img src={bgImage} alt="Background Preview" className="bg-preview" />
              )}
            </div>
          </div>

          {/* Logout */}
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