import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-amber-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <FaUserCircle className="text-3xl text-blue-700 animate-bounce" />
          <span className="text-2xl font-bold text-blue-900 tracking-wide">SAKTHIINTELLITRACK</span>
        </div>
        <div className="space-x-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => navigate('/login')}
          >
            <FaSignInAlt className="inline mr-2" />Login
          </button>
          <button
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition"
            onClick={() => navigate('/register')}
          >
            <FaUserPlus className="inline mr-2" />Register
          </button>
        </div>
      </header>
      {/* Main Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-4 animate-fade-in">Welcome to SAKTHIINTELLITRACK</h1>
        <p className="text-lg text-gray-700 mb-8 animate-slide-up">Smart Box Tracking & Monitoring Solution for Modern Logistics</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
          <section className="bg-white rounded-lg shadow-lg p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-amber-700 mb-2">Who We Are</h2>
            <p className="text-gray-600">SAKTHIINTELLITACK is a cutting-edge platform designed to revolutionize logistics and supply chain management by providing real-time tracking, analytics, and smart monitoring of various box types.</p>
          </section>
          <section className="bg-white rounded-lg shadow-lg p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">Benefits</h2>
            <ul className="list-disc list-inside text-gray-600">
              <li>Real-time box tracking and status updates</li>
              <li>Comprehensive analytics and usage statistics</li>
              <li>Easy monitoring of deliveries and returns</li>
              <li>Secure access and user management</li>
              <li>Modern, intuitive dashboard UI</li>
            </ul>
          </section>
        </div>
        <div className="flex justify-center space-x-8 mt-8">
          <div className="flex flex-col items-center animate-bounce">
            <img src="https://cdn-icons-png.flaticon.com/512/1042/1042331.png" alt="Smart Box" className="w-16 h-16 mb-2" />
            <span className="text-blue-700 font-semibold">Smart Boxes</span>
          </div>
          <div className="flex flex-col items-center animate-bounce">
            <img src="https://cdn-icons-png.flaticon.com/512/1042/1042343.png" alt="Delivery" className="w-16 h-16 mb-2" />
            <span className="text-amber-700 font-semibold">Fast Delivery</span>
          </div>
          <div className="flex flex-col items-center animate-bounce">
            <img src="https://cdn-icons-png.flaticon.com/512/1042/1042346.png" alt="Analytics" className="w-16 h-16 mb-2" />
            <span className="text-blue-700 font-semibold">Analytics</span>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="text-center py-4 text-gray-500">
        &copy; {new Date().getFullYear()} SAKTHIINTELLITACK. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
