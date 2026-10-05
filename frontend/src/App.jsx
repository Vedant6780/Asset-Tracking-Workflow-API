/**
 * App — Root component with React Router.
 * Routes: / → Login, /operator → OperatorDashboard, /manager → ManagerDashboard
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import OperatorDashboard from './pages/OperatorDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const isManager = role === 'admin' || role === 'manager';
  const isOperator = role === 'operator';

  if (requiredRole === 'admin' && !isManager) {
    return <Navigate to="/operator" replace />;
  }

  if (requiredRole === 'operator' && !isOperator) {
    return <Navigate to="/manager" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/operator"
        element={
          <ProtectedRoute requiredRole="operator">
            <OperatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager"
        element={
          <ProtectedRoute requiredRole="admin">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
