import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import Analytics from './pages/Analytics';
import ClaimsCenter from './pages/ClaimsCenter';
import Dashboard from './pages/Dashboard';
import KnowledgeHub from './pages/KnowledgeHub';
import Landing from './pages/Landing';
import LiveOperations from './pages/LiveOperations';
import Login from './pages/Login';
import Policies from './pages/Policies';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Workflow from './pages/Workflow';
import { usePlatform } from './context/PlatformContext';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = usePlatform();
  if (loading) {
    return <div className="route-shell p-6 text-slate-200">Loading session...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = usePlatform();
  if (loading) {
    // Let public pages render immediately while auth state settles.
    return children;
  }

  return isAuthenticated ? <Navigate to="/app/overview" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        <Route
          path="/app"
          element={<PrivateRoute><AppShell /></PrivateRoute>}
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Dashboard />} />
          <Route path="policies" element={<Policies />} />
          <Route path="claims" element={<ClaimsCenter />} />
          <Route path="live-ops" element={<LiveOperations />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="workflow" element={<Workflow />} />
          <Route path="knowledge" element={<KnowledgeHub />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/home" element={<Navigate to="/app/overview" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
