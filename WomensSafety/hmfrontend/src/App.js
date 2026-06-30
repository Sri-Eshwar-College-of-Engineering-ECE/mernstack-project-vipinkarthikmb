import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import LivePage from './Livepage';
import DetectionPage from './Detection';
import LocationPage from './Location';
import SensusPage from './Sensus';
import AboutPage from './About';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn') === 'true';
    const savedUsername = localStorage.getItem('username') || '';
    const savedToken = localStorage.getItem('token') || '';
    
    setIsLoggedIn(savedLoginState);
    setUsername(savedUsername);
    setToken(savedToken);
  }, []);

  const handleLogin = (token, username) => {
    setIsLoggedIn(true);
    setUsername(username);
    setToken(token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setToken('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        {/* Login Page (Start Page) */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* Dashboard Page */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard onLogout={handleLogout} username={username} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Live Page */}
        <Route
          path="/Livepage"
          element={
            isLoggedIn ? (
              <LivePage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Detection Page */}
        <Route
          path="/Detection"
          element={
            isLoggedIn ? (
              <DetectionPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Location Page */}
        <Route
          path="/location"
          element={
            isLoggedIn ? (
              <LocationPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Sensus Page */}
        <Route
          path="/sensus"
          element={
            isLoggedIn ? (
              <SensusPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* About Page */}
        <Route
          path="/about"
          element={
            isLoggedIn ? (
              <AboutPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
