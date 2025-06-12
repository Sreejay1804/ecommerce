import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AuthPage from './components/Auth/AuthPage';
import MainDashboard from './components/MainDashboard';
import './components/MainDashboard.css';
import CustomerManagementApp from './CustomerManagementApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/customer-management" element={<CustomerManagementApp />} />
        <Route path="/sales" element={<div>Sales Invoice Component</div>} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;