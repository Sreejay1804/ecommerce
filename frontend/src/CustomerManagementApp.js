import { useState } from 'react';
import './CustomerManagementApp.css';

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission for adding/editing customer
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (isEditing && selectedCustomerId !== null) {
      // Update existing customer
      setCustomers(customers.map(customer => 
        customer.id === selectedCustomerId 
          ? { ...formData, id: selectedCustomerId } 
          : customer
      ));
      setIsEditing(false);
      setSelectedCustomerId(null);
    } else {
      // Add new customer
      const newCustomer = {
        ...formData,
        id: Date.now()
      };
      setCustomers([...customers, newCustomer]);
    }
    
    // Reset form
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

  // Handle customer deletion
  const handleDeleteCustomer = (id) => {
    setCustomers(customers.filter(customer => customer.id !== id));
  };

  // Handle customer edit
  const handleEditCustomer = (customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setSelectedCustomerId(customer.id);
    setIsEditing(true);
    setActiveMenu('add');
  };

  // Render different content based on the active menu
  const renderContent = () => {
    // If customer options should be shown
    if (showCustomerOptions && !activeMenu) {
      return (
        <div className="options-container">
          <h2 className="section-title">Customer Management Options</h2>
          <div className="options-grid">
            <button
              onClick={() => setActiveMenu('add')}
              className="btn btn-blue"
            >
              Add Customer
            </button>
            <button
              onClick={() => setActiveMenu('enquire')}
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
            <div>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
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
                />
              </div>
              <div className="button-group">
                <button
                  onClick={handleSubmit}
                  className="btn btn-blue"
                >
                  {isEditing ? 'Update Customer' : 'Add Customer'}
                </button>
                <button
                  onClick={() => {
                    setActiveMenu(null);
                    setShowCustomerOptions(true);
                    setIsEditing(false);
                    setSelectedCustomerId(null);
                    setFormData({ name: '', email: '', phone: '', address: '' });
                  }}
                  className="btn btn-gray"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        );
      case 'enquire':
        return (
          <div className="content-panel">
            <h2 className="section-title">Customer Enquiry</h2>
            <p className="helper-text">Search for customer information</p>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="form-input"
            />
            <div className="button-group">
              <button className="btn btn-blue">
                Search
              </button>
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
          </div>
        );
      case 'delete':
        return (
          <div className="content-panel">
            <h2 className="section-title">Modify or Delete Customer</h2>
            <p className="helper-text">Select a customer from the table below to edit or delete</p>
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
          <h2 className="section-title">Customer List</h2>
          {customers.length > 0 ? (
            <div className="table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
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
                      <td className="table-cell">{customer.name}</td>
                      <td className="table-cell">{customer.email}</td>
                      <td className="table-cell">{customer.phone}</td>
                      <td className="table-cell">{customer.address}</td>
                      <td className="table-cell">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="btn-link btn-blue-link"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="btn-link btn-red-link"
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