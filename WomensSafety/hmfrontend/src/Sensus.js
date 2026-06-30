import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sensus.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const Sensus = () => {
  const [timePeriod, setTimePeriod] = useState('Last Day');
  const [reports, setReports] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [incharge, setIncharge] = useState('');
  const navigate = useNavigate();

  const data = {
    labels: ['Harassment', 'Non-Harassment'],
    datasets: [
      {
        label: 'Number of Reports',
        data:
          timePeriod === 'Last Day'
            ? [5, 3]
            : timePeriod === 'Last Month'
            ? [20, 12]
            : timePeriod === 'Last Year'
            ? [150, 80]
            : [0, 0],
        backgroundColor: ['red', 'green'],
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleNavigation = (path, tab) => {
    navigate(path);
  };

  return (
    <div className="sensus-container">
      <div className="sidebar">
        <div className="sidebar-header">DASHBOARD</div>
        <ul className="nav-links">
          <li className="nav-item" onClick={() => handleNavigation('/', 'Home')}>
            <button className="nav-button">Home</button>
          </li>
          <li className="nav-item" onClick={() => handleNavigation('/Livepage', 'Live')}>
            <button className="nav-button">Live</button>
          </li>
          <li className="nav-item" onClick={() => handleNavigation('/Detection', 'Detection')}>
            <button className="nav-button">Detection</button>
          </li>
          <li className="nav-item" onClick={() => handleNavigation('/Location', 'Location')}>
            <button className="nav-button">Location</button>
          </li>
          <li className="nav-item active" onClick={() => handleNavigation('/Sensus', 'Sensus')}>
            <button className="nav-button">Sensus</button>
          </li>
          <li className="nav-item" onClick={() => handleNavigation('/About', 'About')}>
            <button className="nav-button">About</button>
          </li>
        </ul>
        <button className="logout" onClick={() => navigate('/logout')}>
          LOG OUT
        </button>
      </div>
      <div className="main-content">
        <div className="sensus-header">SENSUS</div>
        <div className="analysis-section">
          <div className="analysis-buttons">
            <button
              className={timePeriod === 'Last Day' ? 'active' : ''}
              onClick={() => setTimePeriod('Last Day')}
            >
              Last Day
            </button>
            <button
              className={timePeriod === 'Last Month' ? 'active' : ''}
              onClick={() => setTimePeriod('Last Month')}
            >
              Last Month
            </button>
            <button
              className={timePeriod === 'Last Year' ? 'active' : ''}
              onClick={() => setTimePeriod('Last Year')}
            >
              Last Year
            </button>
          </div>
          <div className="bar-graph">
            <Bar data={data} options={options} />
          </div>
        </div>
        <div className="report-details">
        <p>No of reports: <input type="text" value="5" readOnly /></p>
        <p>Action taken: <input type="text" value="3" readOnly /></p>
        <p>O incharge: <input type="text" value="2" readOnly /></p>
        </div>
      </div>
    </div>
  );
};

export default Sensus;
