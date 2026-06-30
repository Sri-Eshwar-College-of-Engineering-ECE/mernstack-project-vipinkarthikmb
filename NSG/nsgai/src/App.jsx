import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/Landingpage';
import LoginPage from './components/Loginpage';
import DashboardHome from './pages/Dashboard';
import VideoAnalysis from './pages/Videoanalysis';
import About from './components/About';
import Alerts from './pages/Alert';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<About/>}/>

        {/* Dashboard Pages */}
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/videoanalysis" element={<VideoAnalysis />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}