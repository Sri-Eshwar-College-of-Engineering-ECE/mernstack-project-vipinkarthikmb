import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/Signup';
import Dashboard from './components/dashboard';
import QuickPay from './components/quickpage';
import ScanReadings from './components/scanread';
import EReceipt from './components/ereciept';
import Profile from './components/Profile';
import About from './components/About';
import Landing from './components/Landing';
import AdminDashboard from './components/admin/AdminDashboard'; // Admin Dashboard route
import AddConsumer from './components/admin/AddConsumer';
import AddReading from './components/admin/AddReading';
import UpdateConsumer from './components/admin/UpdateConsumer'; // Import UpdateConsumer component
import Payment from './components/Payment'; // Import Payment component

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const navigate = useNavigate();

  // Check user in session storage when app starts
  useEffect(() => {
    // Clear old persisted auth data so a fresh session is required after browser restart
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');

    const token = sessionStorage.getItem('token');
    const name = sessionStorage.getItem('userName');
    const role = sessionStorage.getItem('userRole');
    const id = sessionStorage.getItem('userId');

    // Require a token and user info to treat the session as authenticated
    if (!token || !name || !role || !id) {
      sessionStorage.clear();
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      const isExpired = decoded?.exp && decoded.exp * 1000 < Date.now();

      if (isExpired) {
        sessionStorage.clear();
        setUser(null);
      } else {
        setUser({ name, role, id });
      }
    } catch (err) {
      // Invalid token format, force logout state
      sessionStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false); // After the check, set loading to false
    }
  }, []); // Empty dependency array to run only once

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    sessionStorage.setItem('userName', userData.name);
    sessionStorage.setItem('userRole', userData.role);
    sessionStorage.setItem('userId', userData.id);
  };

  const handleLogout = () => {
    sessionStorage.clear(); // Clear session data
    setUser(null);
    navigate('/login'); // Redirect to login page
  };

  // If app is loading, show a loading indicator
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Handle login routing logic */}
      <Route
        path="/login"
        element={
          user ? (
            user.role === 'admin' ? (
              <Navigate to="/admin-dashboard" />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route
        path="/quickpage"
        element={user ? <QuickPay onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route
        path="/scanread"
        element={user ? <ScanReadings onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route
        path="/ereciept"
        element={user ? <EReceipt onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile"
        element={user ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route path="/about" element={<About />} />

      {/* Payment Route */}
      <Route
        path="/payment"
        element={
          user ? (
            <Payment onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Protected Admin Dashboard Route */}
      <Route
        path="/admin-dashboard"
        element={
          user?.role === 'admin' ? (
            <AdminDashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Add Consumer Route */}
      <Route
        path="/add-consumer"
        element={
          user?.role === 'admin' ? (
            <AddConsumer onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Add Reading Route */}
      <Route
        path="/add-reading"
        element={
          user?.role === 'admin' ? (
            <AddReading onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Update Consumer Route */}
      <Route
        path="/update-consumer"
        element={
          user?.role === 'admin' ? (
            <UpdateConsumer onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
    </div>
  );
}

export default App;