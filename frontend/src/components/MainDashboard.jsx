import { useNavigate } from 'react-router-dom';

function MainDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Invoice Management System</h1>
      </div>
      <div className="dashboard-content">
        <div 
          className="card"
          onClick={() => navigate('/customer-management')}
          role="button"
          tabIndex={0}
        >
          <div className="card-icon">📝</div>
          <h2>Purchase Invoice</h2>
          <p>Manage purchase invoices and customer details</p>
        </div>
        <div 
          className="card"
          onClick={() => navigate('/sales')}
          role="button"
          tabIndex={0}
        >
          <div className="card-icon">💰</div>
          <h2>Sales Invoice</h2>
          <p>Manage sales invoices and transactions</p>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;