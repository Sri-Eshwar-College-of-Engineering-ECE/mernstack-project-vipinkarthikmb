import React, { useState } from 'react';
import './Login.css';
import googleIcon from './images/Googleicon.png';
import wmLogo from './images/WMLogo.png';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => { // Receive onLogin prop
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(null);

    const handleLoginSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setLoginError(null); // Reset error state
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', { // Correct endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }), // Send username and password
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            onLogin(data.token, username); // Call the onLogin function with token and username
            navigate('/dashboard'); // Navigate to dashboard upon successful login
        } catch (error) {
            console.error("Login error:", error);
            setLoginError(error.message || "Invalid credentials.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">LOGIN</div>
                <div className="wm-title">Women's Safety</div>
                <div className="image-container">
                    <img src={wmLogo} alt="Women's Safety Logo" className="profile-image" />
                </div>
                {loginError && <div className="error-message">{loginError}</div>} {/* Display login error */}
                <form onSubmit={handleLoginSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="login-button" type="submit">Login</button>
                </form>
                <div className="or-divider">(or)</div>
                <button className="google-button">
                    <img src={googleIcon} alt="Google" className="google-icon" />
                    Continue with Google
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
