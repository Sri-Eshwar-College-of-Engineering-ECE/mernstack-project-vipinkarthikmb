// src/main.jsx or src/index.jsx
import React from 'react';
import './tailwind.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom'; // Wrap only here

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router> {/* Only wrap here */}
    <App />
  </Router>
);
