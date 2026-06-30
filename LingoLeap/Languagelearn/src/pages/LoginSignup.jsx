import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginSignup.css';

const Signup = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/signup', formData);
      if (response.data.success) {
        setMessage('Sign up successful! Welcome!');
        setIsAuthenticated(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(response.data.message || ' Signup failed. Try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred. Try again.');
    }
  };
  return (
    <div className="signup-container flex justify-center items-center min-h-screen bg-gray-100">
      <div className="signup-card bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="signup-title text-2xl font-semibold text-center mb-4">Sign Up</h2>
        {message && <div className="message success bg-green-100 text-green-800 p-2 rounded mb-4">{message}</div>}
        {error && <div className="message error bg-red-100 text-red-800 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="input-field p-2 border rounded w-full mb-4" />
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="input-field p-2 border rounded w-full mb-4" />
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="input-field p-2 border rounded w-full mb-4" />
          <button type="submit" className="submit-button bg-blue-500 text-white w-full py-2 rounded mt-4">Sign Up</button>
        </form>
      </div>
    </div>
  );
};
export default Signup;