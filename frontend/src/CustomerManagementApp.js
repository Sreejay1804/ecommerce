import { useEffect, useState } from 'react';
import './CustomerManagementApp.css';

// API service functions
const API_BASE_URL = 'http://localhost:8080/api/customers';

const customerService = {
  getAllCustomers: async () => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
  },
  
  getCustomerById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch customer');
    return response.json();
  },
  
  searchCustomers: async (term) => {
    const response = await fetch(`${API_BASE_URL}/search?term=${encodeURIComponent(term)}`);
    if (!response.ok) throw new Error('Failed to search customers');
    return response.json();
  },
  
  createCustomer: async (customer) => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
  },
  
  updateCustomer: async (id, customer) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    if (!response.ok) throw new Error('Failed to update customer');
    return response.json();
  },
  
  deleteCustomer: async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete customer');
    return response.ok;
  },
};

export default function CustomerManagementApp() {
  // State for tracking active menu and customer data
  const [showCustomerOptions, setShowCustomerOptions] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Load all customers from API
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomers();
      setCustomers(data);
      setError('');
    } catch (err) {
      setError('Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission for adding/editing customer
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      if (isEditing && selectedCustomerId !== null) {
        // Update existing customer
        await customerService.updateCustomer(selectedCustomerId, formData);
        setIsEditing(false);
        setSelectedCustomerId(null);
      } else {
        // Add new customer
        await customerService.createCustomer(formData);
      }
      
      // Reset form and reload customers
      setFormData({ name: '', email: '', phone: '', address: '' });
      await loadCustomers();
      
      // Show success message or navigate back
      setActiveMenu(null);
      setShowCustomerOptions(true);
    } catch (err) {
      setError('Failed to save customer: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle customer deletion
  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      setLoading(true);
      await customerService.deleteCustomer(id);
      await loadCustomers();
      setError('');
    } catch (err) {
      setError('Failed to delete customer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle customer edit
  const handleEditCustomer = (customer) => {
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setSelectedCustomerId(customer.id);
    setIsEditing(true);
    setActiveMenu('add');
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await customerService.searchCustomers(searchTerm);
      setSearchResults(results);
      setError('');
    } catch (err) {
      setError('Failed to search customers');
      setSearchResults([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Reset form and states
  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '' });
    setIsEditing(false);
    setSelectedCustomerId(null);
    setError('');
  };

  // Render different content based on the active menu
  const renderContent = () => {
    // Show loading spinner if loading
    if (loading && activeMenu === null) {
      return (
        <div className="content-panel">
          <h2 className="section-title">Loading...</h2>
        </div>
      );
    }

    // If customer options should be shown
    if (showCustomerOptions && !activeMenu) {
      return (
        <div className="options-container">
          <h2 className="section-title">Customer Management Options</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="options-grid">
            <button
              onClick={() => {
                resetForm();
                setActiveMenu('add');
              }}
              className="btn btn-blue"
            >
              Add Customer
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchResults([]);
                setActiveMenu('enquire');
              }}
              className="btn btn-green"
            >
              Enquire Customer
            </button>
            <button
              onClick={() => setActiveMenu('delete')}
              className="btn btn-purple"
            >
              Delete or Modify Customer
            </button>
          </div>
        </div>
      );
    }
    
    // Otherwise show the selected menu content
    switch (activeMenu) {
      case 'add':
        return (
          <div className="content-panel">
            <h2 className="section-title">{isEditing ? 'Edit Customer' : 'Add Customer'}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  rows="3"
                />
              </div>
              <div className="button-group">
                <button
                  type="submit"
                  className="btn btn-blue"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (isEditing ? 'Update Customer' : 'Add Customer')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu(null);
                    setShowCustomerOptions(true);
                    resetForm();
                  }}
                  className="btn btn-gray"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        );
      case 'enquire':
        return (
          <div className="content-panel">
            <h2 className="section-title">Customer Enquiry</h2>
            <p className="helper-text">Search for customer information</p>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="form-input"
              />
            </div>
            <div className="button-group">
              <button 
                onClick={handleSearch}
                className="btn btn-blue"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button
                onClick={() => {
                  setActiveMenu(null);
                  setShowCustomerOptions(true);
                  setSearchResults([]);
                  setSearchTerm('');
                }}
                className="btn btn-gray"
              >
                Back
              </button>
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="search-results">
                <h3 className="section-title">Search Results</h3>
                <div className="table-wrapper">
                  <table className="customer-table">
                    <thead>
                      <tr>
                        <th className="table-header">Name</th>
                        <th className="table-header">Email</th>
                        <th className="table-header">Phone</th>
                        <th className="table-header">Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((customer) => (
                        <tr key={customer.id}>
                          <td className="table-cell">{customer.name}</td>
                          <td className="table-cell">{customer.email}</td>
                          <td className="table-cell">{customer.phone || 'N/A'}</td>
                          <td className="table-cell">{customer.address || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {searchTerm && searchResults.length === 0 && !loading && (
              <p className="empty-message">No customers found matching your search.</p>
            )}
          </div>
        );
      case 'delete':
        return (
          <div className="content-panel">
            <h2 className="section-title">Modify or Delete Customer</h2>
            <p className="helper-text">Select a customer from the table below to edit or delete</p>
            {error && <div className="error-message">{error}</div>}
            <button
              onClick={() => {
                setActiveMenu(null);
                setShowCustomerOptions(true);
              }}
              className="btn btn-gray"
            >
              Back
            </button>
          </div>
        );
      default:
        return (
          <div className="content-panel">
            <h2 className="section-title">Customer Management System</h2>
            <p className="helper-text">Click the Customer button in the sidebar to get started.</p>
            {error && <div className="error-message">{error}</div>}
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Dashboard</h1>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-item">
            <button
              onClick={() => {
                setShowCustomerOptions(!showCustomerOptions);
                setActiveMenu(null);
                resetForm();
              }}
              className="sidebar-button"
            >
              Customer
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-container">
        {/* Top content area */}
        <main className="main-content">
          {renderContent()}
        </main>

        {/* Customer Table */}
        <div className="table-container">
          <div className="table-header-section">
            <h2 className="section-title">Customer List</h2>
            <button
              onClick={loadCustomers}
              className="btn btn-blue btn-small"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {loading && customers.length === 0 ? (
            <p className="empty-message">Loading customers...</p>
          ) : customers.length > 0 ? (
            <div className="table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th className="table-header">ID</th>
                    <th className="table-header">Name</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Phone</th>
                    <th className="table-header">Address</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="table-cell">{customer.id}</td>
                      <td className="table-cell">{customer.name}</td>
                      <td className="table-cell">{customer.email}</td>
                      <td className="table-cell">{customer.phone || 'N/A'}</td>
                      <td className="table-cell">{customer.address || 'N/A'}</td>
                      <td className="table-cell">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="btn-link btn-blue-link"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="btn-link btn-red-link"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-message">No customers available. Add a customer to see them listed here.</p>
          )}
        </div>
      </div>
    </div>
  );
}