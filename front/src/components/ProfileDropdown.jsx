import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileDropdown.css";

const ProfileDropdown = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [bgImage, setBgImage] = useState("");
  const navigate = useNavigate();

  const toggleDropdown = () => setOpen(!open);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) setBgImage(URL.createObjectURL(file));
  };

  const generateAIBg = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const aiBgUrl = `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/400/100`;
    setBgImage(aiBgUrl);
  };

  const redirectAuth = (path) => navigate(path);

  return (
    <div className="profile-dropdown-container">
      <div className="profile-trigger" onClick={toggleDropdown}>
        <img
          src={
            profileImage ||
            (user?.email
              ? `https://www.gravatar.com/avatar/${user.email}?d=identicon`
              : "https://via.placeholder.com/36")
          }
          alt="Profile"
          className="profile-avatar"
        />
        {/* <span className="profile-name">{user?.name || "Guest"}</span> */}
      </div>

      {open && (
        <div className="profile-dropdown-menu">
          {user ? (
            <>
              {/* Profile Section */}
              <div className="dropdown-section hover-section">
                <div className="dropdown-title">Profile</div>
                <div className="floating-submenu">
                  <div>Email: {user.email}</div>
                  <div>Account: {user.accountName}</div>
                  <div>Role: {user.role}</div>
                  {user.isAdmin && <button className="switch-role-btn">Switch Role</button>}
                </div>
              </div>

              {/* Settings Section */}
              <div className="dropdown-section hover-section">
                <div className="dropdown-title">Settings</div>
                <div className="floating-submenu">
                  <div>Role: {user.role}</div>
                  {user.isAdmin && <button className="switch-role-btn">Switch Role</button>}
                  <div className="bg-upload">
                    <label htmlFor="bg-upload-input">Upload Background</label>
                    <input
                      type="file"
                      id="bg-upload-input"
                      accept="image/*"
                      onChange={handleBgUpload}
                    />
                    <button className="ai-bg-btn" onClick={generateAIBg}>
                      Generate AI Background
                    </button>
                  </div>
                  {bgImage && (
                    <img src={bgImage} alt="Background" className="bg-preview" />
                  )}
                </div>
              </div>

              {/* Logout */}
              <div className="dropdown-section">
                <button className="logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Guest User */}
              <div className="dropdown-section hover-section" onClick={() => redirectAuth("/signup")}>
                <div className="dropdown-title">Profile</div>
                <div className="floating-submenu">Email: guest@example</div>
                <div className="floating-submenu">Name: Guest</div>
                <button className="switch-role-btn" onClick={() => redirectAuth("/login")}>
                    Switch Roles
                  </button>
              </div>

              <div className="dropdown-section hover-section" onClick={() => redirectAuth("/signup")}>
                <div className="dropdown-title">Settings</div>
                <div className="floating-submenu">
                  
                  <button className="ai-bg-btn" onClick={() => redirectAuth("/login")}>
                    Generate AI Background
                  </button>
                  <button className="upload-bg-img" onClick={() => redirectAuth("/login")}>
                    Upload Image
                  </button>
                  
                  {bgImage && (
                    <img src={bgImage} alt="Background" className="bg-preview" />
                  )}
                </div>
              </div>

              <div className="dropdown-section" onClick={() => redirectAuth("/login")}>
                <div>Login</div>
              </div>

              <div className="dropdown-section" onClick={() => redirectAuth("/signup")}>
                <div>Signup</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;