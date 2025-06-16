import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <>
      <div className="dashboard-wrapper"></div>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.username}</h1>
          <button className="btn btn-logout" onClick={logout}>Logout</button>
        </div>
        <div className="dashboard-content">
        <div 
          className="card"
          onClick={() => navigate('/sales')}
          role="button"
          tabIndex={0}
        >
          <div className="card-icon">📝</div>
          <h2>Purchase Invoice</h2>
          <p>Manage purchase invoices and customer details</p>
        </div>
        <div 
          className="card"
          
          onClick={() => navigate('/customer-management')}
          role="button"
          tabIndex={0}
        >
          <div className="card-icon">💰</div>
          <h2>Sales Invoice</h2>
          <p>Manage sales invoices and transactions</p>
        </div>
      </div>
      </div>
    </>
  );
}