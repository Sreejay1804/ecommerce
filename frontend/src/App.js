import { useState } from 'react';
import './App.css';
import Register from './components/Register';
import SignIn from './components/SignIn';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import CustomerManagementApp from './CustomerManagementApp'; // Adjust path if needed

function AppContent() {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!user) {
    return showRegister ? (
      <Register
        onSuccess={() => setShowRegister(false)}
        onSwitchToSignIn={() => setShowRegister(false)}
      />
    ) : (
      <SignIn
        onSuccess={() => {}}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return <CustomerManagementApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}