import { useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { AuthProvider, useAuth } from './context/AuthContext'
import Analytics from './pages/Analytics'
import Dashboard from './pages/Dashboard'
import Login, { LandingPage } from './pages/Login'
import AlertsPage from './pages/Settings'
import StorageDetails from './pages/StorageDetails'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function AppShell() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const titleMap = {
    '/dashboard': 'Operations Dashboard',
    '/storage': 'Storage Unit Details',
    '/alerts': 'Alerts & Notifications',
    '/analytics': 'Analytics & Reports',
  }

  const pageTitle = titleMap[location.pathname] || 'StorageSphere'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-dashboardGradient">
      <div className="hero-orb -left-20 top-28 h-72 w-72 bg-tealAccent/15" />
      <div className="hero-orb right-0 top-4 h-80 w-80 bg-violetGlow/10" />
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="relative z-10 flex-1 overflow-x-hidden p-4 md:p-6">
        <Navbar title={pageTitle} onMenuClick={() => setIsOpen(true)} onLogout={handleLogout} userName={user?.name || 'Team User'} />

        <div className="mb-5 animate-slideIn rounded-xl border border-tealAccent/30 bg-heroGradient px-4 py-3 text-sm text-tealAccent">
          ✅ Live signal healthy. StorageSphere is actively monitoring all connected cold units.
        </div>

        <div className="pb-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/storage" element={<StorageDetails />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/analytics" element={<Analytics />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
