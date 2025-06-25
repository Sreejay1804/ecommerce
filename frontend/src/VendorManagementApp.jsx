import { useEffect, useState } from 'react';
import AddVendor from './components/AddVendor';
import DeleteVendor from './components/DeleteVendor';
import EnquireVendor from './components/EnquireVendor';
import { useAuth } from './contexts/AuthContext';
import { useVendor } from './contexts/VendorContext';
import vendorService from './services/vendorService';
import './styles/VendorManagement.css';

const VENDOR_API = '/api/vendors';

export default function VendorManagementApp() {
  const { user, logout } = useAuth();
  const { vendors, setVendors } = useVendor();
  const [activeMenu, setActiveMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vendorService.getVendors();
      setVendors(data || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const addVendor = async (data) => {
    // Client-side validation - check for duplicates
    const emailExists = vendors.some(
      (vendor) => vendor.email.toLowerCase() === data.email.toLowerCase()
    );
    const phoneExists = vendors.some(
      (vendor) => vendor.phone === data.phone
    );
    const gstExists = vendors.some(
      (vendor) => vendor.gstNumber === data.gstNumber
    );
    
    if (emailExists) {
      return { success: false, error: 'A vendor with this email already exists' };
    }
    if (phoneExists) {
      return { success: false, error: 'A vendor with this phone number already exists' };
    }
    if (gstExists) {
      return { success: false, error: 'A vendor with this GST number already exists' };
    }

    try {
      const res = await fetch(VENDOR_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add vendor');
      }
      
      const newVendor = await res.json();
      setVendors([...vendors, newVendor]);
      return { success: true };
    } catch (err) {
      console.error('Add vendor error:', err);
      return { success: false, error: err.message };
    }
  };

  const updateVendor = async (id, data) => {
    try {
      const res = await fetch(`${VENDOR_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update vendor');
      }
      
      const updated = await res.json();
      setVendors(vendors.map(v => v.id === id ? updated : v));
      return { success: true };
    } catch (err) {
      console.error('Update vendor error:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteVendor = async (id) => {
    try {
      const res = await fetch(`${VENDOR_API}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete vendor');
      }
      setVendors(vendors.filter(v => v.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Delete vendor error:', err);
      return { success: false, error: err.message };
    }
  };

  const searchVendors = async (term) => {
    if (!term.trim()) return vendors;
    try {
      // Updated to use the backend search endpoint properly
      const res = await fetch(`${VENDOR_API}/search?name=${encodeURIComponent(term)}`);
      if (!res.ok) throw new Error('Search failed');
      return await res.json();
    } catch (err) {
      console.error('Search error:', err);
      // Fallback to client-side search
      return vendors.filter(v =>
        v.name.toLowerCase().includes(term.toLowerCase()) ||
        v.email.toLowerCase().includes(term.toLowerCase()) ||
        v.phone.includes(term) ||
        (v.address && v.address.toLowerCase().includes(term.toLowerCase())) ||
        (v.gstNumber && v.gstNumber.toLowerCase().includes(term.toLowerCase()))
      );
    }
  };

  const renderPanel = () => {
    switch (activeMenu) {
      case 'add':
        return (
          <AddVendor 
            onAddVendor={addVendor} 
            onUpdateVendor={updateVendor} 
            onBack={() => {
              setActiveMenu(null);
              // Remove edit parameter from URL
              const url = new URL(window.location);
              url.searchParams.delete('edit');
              window.history.pushState(null, '', url);
            }} 
            vendors={vendors}
          />
        );
      case 'enquire':
        return <EnquireVendor 
          onSearchVendors={searchVendors} 
          onBack={() => setActiveMenu(null)} 
        />;
      case 'delete':
        return <DeleteVendor 
          vendors={vendors} 
          onEditVendor={() => setActiveMenu('add')} 
          onDeleteVendor={deleteVendor} 
          onBack={() => setActiveMenu(null)} 
        />;
      default:
        return null;
    }
  };

  const renderVendorButtons = () => {
    if (!activeMenu) {
      return (
        <div className="content-panel">
          <h2 className="section-title">Vendor Management</h2>
          <div className="customer-actions-row" style={{ marginTop: '20px' }}>
            <button 
              onClick={() => setActiveMenu('add')} 
              className="btn btn-blue"
            >
              Add Vendor
            </button>
            <button 
              onClick={() => setActiveMenu('enquire')} 
              className="btn btn-green"
            >
              Enquire Vendor
            </button>
            <button 
              onClick={() => setActiveMenu('delete')} 
              className="btn btn-red"
            >
              Delete/Modify Vendor
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderVendorList = () => {
    if (activeMenu !== null) return null;

    return (
      <div className="table-container">
        <h2 className="section-subtitle">Vendor List</h2>
        {loading ? (
          <p className="helper-text">Loading vendors...</p>
        ) : error ? (
          <div className="error-message">
            <p>Error loading vendors: {error}</p>
            <button onClick={fetchVendors} className="btn btn-blue">Retry</button>
          </div>
        ) : vendors.length > 0 ? (
          <div className="table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>GST Number</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(vendor => (
                  <tr key={vendor.id}>
                    <td>{vendor.name}</td>
                    <td>{vendor.email}</td>
                    <td>{vendor.phone}</td>
                    <td>{vendor.address || 'N/A'}</td>
                    <td>{vendor.gstNumber || 'N/A'}</td>
                    <td>{vendor.description || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleEditFromList(vendor)} 
                          className="btn-link btn-blue-link"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteFromList(vendor)} 
                          className="btn-link btn-red-link btn-red-link:hover"
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
        ) : (
          <p className="empty-message">No vendors available. Add a vendor to see them listed here.</p>
        )}
      </div>
    );
  };

  const handleEditFromList = (vendor) => {
    // Update URL to include edit parameter
    const url = new URL(window.location);
    url.searchParams.set('edit', vendor.id);
    window.history.pushState(null, '', url);
    
    // Switch to edit mode
    setActiveMenu('add');
  };

  const handleDeleteFromList = async (vendor) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${vendor.name}?`
    );
    
    if (confirmDelete) {
      try {
        const result = await deleteVendor(vendor.id);
        if (result.success) {
          alert('Vendor deleted successfully!');
        } else {
          alert('Failed to delete vendor: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        alert('An error occurred while deleting the vendor');
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div>
          <div className="sidebar-header">
            <h1 className="sidebar-title">Dashboard</h1>
          </div>
          <div className="sidebar-content">
            <div className="sidebar-item">
              <button onClick={() => setActiveMenu(null)} className="sidebar-button">Vendor</button>
            </div>
          </div>
        </div>
        {/* Spacer to push logout to the bottom */}
        <div style={{ flex: 1 }}></div>
        <div className="sidebar-footer" style={{ padding: '16px', marginTop: 'auto' }}>
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '14px', marginBottom: '8px' }}>Logged in as <b>{user.username}</b></span>
              <button className="btn btn-red" onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <div className="main-container">
        <main className="main-content">
          {/* First render the panel */}
          {renderPanel()}
          {/* Then render vendor buttons if we're in vendor module */}
          {renderVendorButtons()}
          {/* Finally render the vendor list if we're in vendor module */}
          {renderVendorList()}
        </main>
      </div>
    </div>
  );
}