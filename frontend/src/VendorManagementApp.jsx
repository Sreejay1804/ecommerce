import { useEffect, useState } from 'react';
import AddVendor from './components/AddVendor';
import DeleteVendor from './components/DeleteVendor';
import EnquireVendor from './components/EnquireVendor';
import { useAuth } from './contexts/AuthContext';
import vendorService from './services/vendorService';
import './styles/Dashboard.css';

const VENDOR_API = 'http://localhost:8080/api/vendors';

export default function VendorManagementApp() {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vendorService.getVendors();
      setVendors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const renderPanel = () => {
    switch (activeMenu) {
      case 'add':
        return <AddVendor onVendorAdded={fetchVendors} />;
      case 'enquire':
        return <EnquireVendor vendors={vendors} />;
      case 'delete':
        return <DeleteVendor onVendorDeleted={fetchVendors} />;
      default:
        return null;
    }
  };

  const renderVendorList = () => {
    if (loading) return <div>Loading vendors...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
      <div className="vendor-list">
        <h3>Vendor List</h3>
        <table>
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
                  <button onClick={() => handleEditFromList(vendor)}>Edit</button>
                  <button onClick={() => handleDeleteFromList(vendor)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <button onClick={() => setActiveMenu('add')} className="sidebar-button">Add Vendor</button>
            <button onClick={() => setActiveMenu('enquire')} className="sidebar-button">Enquire Vendor</button>
            <button onClick={() => setActiveMenu('delete')} className="sidebar-button">Delete/Modify Vendor</button>
          </div>
        </div>
        <div className="sidebar-footer">
          {user && (
            <div>
              <span>Logged in as <b>{user.username}</b></span>
              <button className="btn btn-red" onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <div className="main-container">
        <main className="main-content">
          {renderPanel()}
          {activeMenu === null && renderVendorList()}
        </main>
      </div>
    </div>
  );
}