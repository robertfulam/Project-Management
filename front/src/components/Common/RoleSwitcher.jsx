import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './RoleSwitcher.css';

const RoleSwitcher = () => {
  const [isAdmin, setIsAdmin] = useState(authService.isAdmin());
  const navigate = useNavigate();

  const handleSwitchRole = () => {
    if (isAdmin) {
      navigate('/user-dashboard');
    } else {
      navigate('/admin-dashboard');
    }
  };

  if (!authService.isAdmin()) return null;

  return (
    <button 
      className={`role-switcher ${isAdmin ? 'admin-mode' : 'user-mode'}`}
      onClick={handleSwitchRole}
      title={isAdmin ? 'Switch to User Dashboard' : 'Switch to Admin Dashboard'}
    >
      {isAdmin ? '👤 User Mode' : '👑 Admin Mode'}
    </button>
  );
};

export default RoleSwitcher;