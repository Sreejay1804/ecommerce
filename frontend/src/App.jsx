import { useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import SignIn from './components/SignIn';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import CustomerManagementApp from './CustomerManagementApp';
//import './CustomerManagementApp.css';
import './styles/Dashboard.css';
//import './styles/ProductModule.css';
//import './styles/Products.css';

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