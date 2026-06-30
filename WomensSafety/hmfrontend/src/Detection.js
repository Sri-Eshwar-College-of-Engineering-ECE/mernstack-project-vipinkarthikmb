import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Detection.css';

const Detection = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null); // 'harassment', 'no-harassment', null
  const [accuracy, setAccuracy] = useState({ harassment: 0, noHarassment: 0 });
  const [activeTab, setActiveTab] = useState('Detection'); // Track active tab
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setVideoFile(file);

    if (file) {
      const simulatedResult = Math.random() > 0.5 ? 'harassment' : 'no-harassment'; // Random result
      const simulatedHarassmentAccuracy = Math.floor(Math.random() * 101); // Random accuracy (0-100)
      const simulatedNoHarassmentAccuracy = 100 - simulatedHarassmentAccuracy; // Ensure total = 100

      setDetectionResult(simulatedResult);
      setAccuracy({
        harassment: simulatedHarassmentAccuracy,
        noHarassment: simulatedNoHarassmentAccuracy,
      });
    }
  };

  const handleTabClick = (tab, path) => {
    setActiveTab(tab);
    navigate(path);
  };

  const isMax = (value) => value === Math.max(accuracy.harassment, accuracy.noHarassment);

  return (
    <div className="detection-container">
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
            onClick={() => handleTabClick('Detection', '/Detection')}
          >
            <button className="nav-button">Detection</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Location' ? 'active' : ''}`}
            onClick={() => handleTabClick('Location', '/Location')}
          >
            <button className="nav-button">Location</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'Sensus' ? 'active' : ''}`}
            onClick={() => handleTabClick('Sensus', '/Sensus')}
          >
            <button className="nav-button">Sensus</button>
          </li>
          <li
            className={`nav-item ${activeTab === 'About' ? 'active' : ''}`}
            onClick={() => handleTabClick('About', '/About')}
          >
            <button className="nav-button">About</button>
          </li>
        </ul>
        <button className="logout" onClick={() => navigate('/logout')}>
          LOG OUT
        </button>
      </div>
      <div className="main-content">
        <div className="detection-header">DETECTION</div>
        <div className="video-upload-area">
          <p>Drop your video</p>
          <p>[To Check if Harassment or Non Harassment]</p>
          <div className="upload-box">
            <label htmlFor="video-upload" className="upload-label">
              Choose Your File <span className="upload-icon">⬆</span>
            </label>
            <input
              type="file"
              id="video-upload"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {videoFile && <p>Selected File: {videoFile.name}</p>}
          </div>
        </div>

        <div className="detection-result">
          <p>Detection Result</p>
          <div className="result-buttons">
            <button
              className={`result-button harassment ${detectionResult === 'harassment' ? 'active' : ''}`}
            >
              Harassment Activities Found
            </button>
            <button
              className={`result-button no-harassment ${detectionResult === 'no-harassment' ? 'active' : ''}`}
            >
              No Harassment Activities Found
            </button>
          </div>
          <div className="accuracy-bars">
            <div
              className={`accuracy-bar harassment-bar ${isMax(accuracy.harassment) ? 'highlight' : ''}`}
              style={{ width: `${accuracy.harassment}%` }}
            ></div>
            <div
              className={`accuracy-bar no-harassment-bar ${isMax(accuracy.noHarassment) ? 'highlight' : ''}`}
              style={{ width: `${accuracy.noHarassment}%` }}
            ></div>
          </div>
          <div className="accuracy-labels">
            <p>Accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detection;
