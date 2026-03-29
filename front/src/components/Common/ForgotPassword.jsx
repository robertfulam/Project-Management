import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.forgotPassword(email);
      console.log('Reset response:', response);
      setSubmitted(true);
      toast.success('Password reset link sent!');
    } catch (error) {
      console.error("Forgot password error:");
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset link';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Reset Password</h2>
        
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <Link to="/login" className="back-link">Back to Login</Link>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h3>Check Your Email</h3>
            <p>We've sent a password reset link to:</p>
            <p className="email-address">{email}</p>
            <p className="instruction">The link expires in 10 minutes.</p>
            <button onClick={() => navigate('/login')} className="btn-primary">
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;