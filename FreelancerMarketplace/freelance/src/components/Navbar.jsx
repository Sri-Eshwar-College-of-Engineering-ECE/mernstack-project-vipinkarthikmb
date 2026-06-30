import React from 'react';
import { useNavigate } from 'react-router-dom';
function Navbar() {
  const navigate = useNavigate();
  return (
    <div className="freelanceDashboard-bottomNavbar">
      <span 
        className="navbar-item dashboard" 
        onClick={() => navigate('/dashboard')}
      >
        Dashboard
      </span>
      <span 
        className="navbar-item projects" 
        onClick={() => navigate('/projects')}
      >
        Projects
      </span>
      <span 
        className="navbar-item payment" 
        onClick={() => navigate('/payment')}
      >
        Payment
      </span>
      <span 
        className="navbar-item settings" 
        onClick={() => navigate('/settings')}
      >
        Settings
      </span>
    </div>
  );
}
export default Navbar;