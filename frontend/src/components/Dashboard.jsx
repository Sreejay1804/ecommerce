import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
          <div className="dashboard-buttons">
            <button 
              className="dashboard-btn"
              data-type="product"
              onClick={() => navigate('/customer-management')}
            >
              Product Invoices
            </button>
            <button 
              className="dashboard-btn"
              data-type="sales"
              onClick={() => navigate('/sales-invoices')}
            >
              Sales Invoices
            </button>
          </div>
        </div>
      </div>
    </>
  );
}