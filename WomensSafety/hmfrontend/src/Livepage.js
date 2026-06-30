import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Livepage.css';

const Livepage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Live');
  const cameraFeeds = [1, 2, 3, 4];

  const handleTabClick = (tab, path) => {
    setActiveTab(tab);
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">DASHBOARD</div>
        <ul className="nav-links">
          <li
            className={`nav-item ${activeTab === 'Home' ? 'active' : ''}`}
            onClick={() => handleTabClick('Home', '/')}
          >
            <button className="nav-button">Home</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Live' ? 'active' : ''}`}
            onClick={() => handleTabClick('Live', '/Livepage')}
          >
            <button className="nav-button">Live</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Detection' ? 'active' : ''}`}
            onClick={() => handleTabClick('Detection', '/detection')}
          >
            <button className="nav-button">Detection</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Location' ? 'active' : ''}`}
            onClick={() => handleTabClick('Location', '/location')}
          >
            <button className="nav-button">Location</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Sensus' ? 'active' : ''}`}
            onClick={() => handleTabClick('Sensus', '/sensus')}
          >
            <button className="nav-button">Sensus</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'About' ? 'active' : ''}`}
            onClick={() => handleTabClick('About', '/about')}
          >
            <button className="nav-button">About</button>
          </li>
        </ul>
        <button className="logout" onClick={() => navigate('/logout')}>
          LOG OUT
        </button>
      </div>
      <div className="main-content">
        <div className="header">DETECTION MONITORING SYSTEM</div>
        <div className="live-feed-container">
          <div className="live-feed-header">LIVE CAMERA FEED</div>
          <div className="camera-grid">
            {cameraFeeds.map((camera) => (
              <div className="camera-feed" key={camera}>
                <div className="camera-label">CAM {camera}</div>
                <div className="camera-view">
                  {/* Video element for all camera feeds */}
                  <video width="100%" height="auto" controls>
                  <source src="/NoSignalFootage.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Livepage;
