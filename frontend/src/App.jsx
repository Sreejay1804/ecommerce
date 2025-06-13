import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignIn from './components/SignIn';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CustomerManagementApp from './CustomerManagementApp';
import './styles/Dashboard.css';

function AppContent() {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="auth-container">
        {showRegister ? (
          <Register
            onSuccess={() => navigate('/dashboard')}
            onSwitchToSignIn={() => setShowRegister(false)}
          />
        ) : (
          <SignIn
            onSuccess={() => navigate('/dashboard')}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/customer-management" element={
        <ProtectedRoute>
          <CustomerManagementApp />
        </ProtectedRoute>
      } />
      <Route path="/sales-invoices" element={
        <ProtectedRoute>
          <div>Sales Invoices Page (To be implemented)</div>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}