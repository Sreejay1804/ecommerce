import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddVendor from './components/AddVendor';
import DeleteVendor from './components/DeleteVendor';
import EnquireVendor from './components/EnquireVendor';
import { useAuth } from './contexts/AuthContext';
import { useVendor } from './contexts/VendorContext';
import vendorService from './services/vendorService';
import './styles/VendorManagement.css';

export default function VendorManagementApp() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { vendors, setVendors } = useVendor();
  const [activeMenu, setActiveMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getVendors();
      setVendors(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchVendors();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderVendorList = () => {
    if (loading) {
      return (
        <div className="loading-message">
          <p>Loading vendors...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-message">
          <p>{error}</p>
          <button 
            className="btn btn-blue" 
            onClick={fetchVendors}
          >
            Retry
          </button>
        </div>
      );
    }

    if (!vendors || vendors.length === 0) {
      return (
        <div className="empty-message">
          <p>No vendors found.</p>
          <button 
            className="btn btn-blue" 
            onClick={() => setActiveMenu('add')}
          >
            Add New Vendor
          </button>
        </div>
      );
    }

    return (
      <div className="table-container">
        <h3 className="section-title">Vendor List</h3>
        <div className="table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(vendor => (
                <tr key={vendor.id}>
                  <td>{vendor.name}</td>
                  <td>{vendor.email}</td>
                  <td>{vendor.phone}</td>
                  <td>{vendor.address}</td>
                  <td>
                    <div className="button-group">
                      <button 
                        className="btn-link"
                        onClick={() => setActiveMenu('modify')}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-link btn-red-link"
                        onClick={() => setActiveMenu('delete')}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Vendor Management</h1>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-item">
            <button 
              onClick={() => setActiveMenu('add')} 
              className={`sidebar-button ${activeMenu === 'add' ? 'active' : ''}`}
            >
              Add Vendor
            </button>
            <button 
              onClick={() => setActiveMenu('enquire')} 
              className={`sidebar-button ${activeMenu === 'enquire' ? 'active' : ''}`}
            >
              Enquire Vendor
            </button>
            <button 
              onClick={() => setActiveMenu('delete')} 
              className={`sidebar-button ${activeMenu === 'delete' ? 'active' : ''}`}
            >
              Delete/Modify Vendor
            </button>
            <button 
              onClick={() => setActiveMenu(null)} 
              className={`sidebar-button ${activeMenu === null ? 'active' : ''}`}
            >
              View All Vendors
            </button>
          </div>
        </div>
        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <span>Logged in as <strong>{user.username}</strong></span>
              <button className="btn btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            <span className="back-icon">←</span>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="main-container">
        <main className="main-content">
          <div className="content-panel">
            {activeMenu === null ? renderVendorList() : (
              <>
                {activeMenu === 'add' && <AddVendor onVendorAdded={fetchVendors} />}
                {activeMenu === 'enquire' && <EnquireVendor vendors={vendors} />}
                {activeMenu === 'delete' && <DeleteVendor onVendorDeleted={fetchVendors} />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}