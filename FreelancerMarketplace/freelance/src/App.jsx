import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Payment from './pages/Payment';
import Settings from './pages/Settings';
function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login isDarkMode={isDarkMode} />} />
        <Route path="/login" element={<Login isDarkMode={isDarkMode} />} />
        <Route path="/signup" element={<Signup isDarkMode={isDarkMode} />} />
        <Route path="/dashboard" element={<Dashboard isDarkMode={isDarkMode} />} />
        <Route path="/projects" element={<Projects isDarkMode={isDarkMode} />} />
        <Route path="/payment" element={<Payment isDarkMode={isDarkMode} />} />
        <Route
          path="/settings"
          element={
            <Settings
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          }
        />
      </Routes>
    </Router>
  );
}


export default App;
