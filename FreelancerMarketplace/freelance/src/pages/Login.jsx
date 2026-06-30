import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="loginPage-container">
      <div className="loginPage-card">
        <h2 className="loginPage-title">Welcome Back</h2>
        <p className="loginPage-subtitle">Please log in to your account</p>
        <form className="loginPage-form" onSubmit={handleLogin}>
          <input
            type="email"
            className="loginPage-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="loginPage-password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="loginPage-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="loginPage-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="loginPage-button">Log In</button>
        </form>
        <p className="loginPage-footer">
          Don't have an account?{' '}
          <span className="loginPage-link" onClick={() => navigate('/signup')}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
