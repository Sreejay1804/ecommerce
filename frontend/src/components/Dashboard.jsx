import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
//import '../styles/Dashboard.css';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: []
  });
  const [purchaseData, setPurchaseData] = useState({
    labels: [],
    datasets: []
  });

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  useEffect(() => {
    // Fetch sales and purchase data
    // This is dummy data - replace with actual API calls
    const mockSalesData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [
        {
          label: 'Total Sales',
          data: [12000, 19000, 15000, 25000, 22000, 30000],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.4
        }
      ]
    };

    const mockPurchaseData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [
        {
          label: 'Total Purchases',
          data: [10000, 15000, 13000, 20000, 18000, 25000],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.4
        }
      ]
    };

    setSalesData(mockSalesData);
    setPurchaseData(mockPurchaseData);
  }, []);

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
            onClick={() => navigate('/vendor-management')}
            role="button"
            tabIndex={0}
          >
            <div className="card-icon">📝</div>
            <h2>Purchase Invoice</h2>
            <p>Manage purchase invoices and vendor details</p>
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
        {/* Analytics Section */}
          <div className="analytics-section">
            <div className="chart-container">
              <div className="chart-card">
                <h2>Sales Overview</h2>
                <Line options={options} data={salesData} />
              </div>
              <div className="chart-card">
                <h2>Purchase Overview</h2>
                <Line options={options} data={purchaseData} />
              </div>
            </div>
          </div>
      </div>
      
    </>
  );
}