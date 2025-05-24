import { useEffect, useState } from 'react';
import './CustomerManagementApp.css';
import AddCustomer from './components/AddCustomer.jsx';
import DeleteModifyCustomer from './components/DeleteModifyCustomer.jsx';
import EnquireCustomer from './components/EnquireCustomer.jsx';



const API_BASE_URL = 'http://localhost:8080/api/customers';

export default function CustomerManagementApp() {
  const [showCustomerOptions, setShowCustomerOptions] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all customers from backend
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Add a new customer
  const addCustomer = async (customerData) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add customer');
      }
      
      const newCustomer = await response.json();
      setCustomers([...customers, newCustomer]);
      return { success: true };
    } catch (err) {
      console.error('Error adding customer:', err);
      return { success: false, error: err.message };
    }
  };

  // Update an existing customer
  const updateCustomer = async (customerId, customerData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update customer');
      }
      
      const updatedCustomer = await response.json();
      setCustomers(customers.map(customer => 
        customer.id === customerId ? updatedCustomer : customer
      ));
      return { success: true };
    } catch (err) {
      console.error('Error updating customer:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete a customer
  const deleteCustomer = async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${customerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      
      setCustomers(customers.filter(customer => customer.id !== customerId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting customer:', err);
      return { success: false, error: err.message };
    }
  };

  // Search customers
  const searchCustomers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      return customers;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/search?term=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search customers');
      }
      const results = await response.json();
      return results;
    } catch (err) {
      console.error('Error searching customers:', err);
      // Fallback to client-side search if backend search fails
      const term = searchTerm.toLowerCase().trim();
      return customers.filter(customer => 
        customer.name.toLowerCase().includes(term) || 
        customer.email.toLowerCase().includes(term)
      );
    }
  };

  const handleMenuNavigation = (menu) => {
    setActiveMenu(menu);
    setShowCustomerOptions(false);
  };

  const handleBackToOptions = () => {
    setActiveMenu(null);
    setShowCustomerOptions(true);
  };

  const renderContent = () => {
    if (showCustomerOptions && !activeMenu) {
      return (
        <div className="options-container">
          <h2 className="section-title">Customer Management Options</h2>
          <div className="options-grid">
            <button onClick={() => handleMenuNavigation('add')} className="btn btn-blue">
              Add Customer
            </button>
            <button onClick={() => handleMenuNavigation('enquire')} className="btn btn-green">
              Enquire Customer
            </button>
            <button onClick={() => handleMenuNavigation('delete')} className="btn btn-purple">
              Delete or Modify Customer
            </button>
          </div>
        </div>
      );
    }

    switch (activeMenu) {
      case 'add':
        return (
          <AddCustomer
            onAddCustomer={addCustomer}
            onUpdateCustomer={updateCustomer}
            onBack={handleBackToOptions}
            customers={customers}
          />
        );
      case 'enquire':
        return (
          <EnquireCustomer
            onSearchCustomers={searchCustomers}
            onEditCustomer={(customer) => {
              setActiveMenu('add');
            }}
            onDeleteCustomer={deleteCustomer}
            onBack={handleBackToOptions}
          />
        );
      case 'delete':
        return (
          <DeleteModifyCustomer
            customers={customers}
            onEditCustomer={(customer) => {
              setActiveMenu('add');
            }}
            onDeleteCustomer={deleteCustomer}
            onBack={handleBackToOptions}
          />
        );
      default:
        return (
          <div className="content-panel">
            <h2 className="section-title">Customer Management System</h2>
            <p className="helper-text">Click the Customer button in the sidebar to get started.</p>
            {error && (
              <div className="error-message">
                <p>Error: {error}</p>
                <button onClick={fetchCustomers} className="btn btn-blue">
                  Retry
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="app-container">
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

      <div className="main-container">
        <main className="main-content">{renderContent()}</main>

        <div className="table-container">
          <h2 className="section-title">Customer List</h2>
          {loading ? (
            <p className="helper-text">Loading customers...</p>
          ) : error ? (
            <div className="error-message">
              <p>Error loading customers: {error}</p>
              <button onClick={fetchCustomers} className="btn btn-blue">
                Retry
              </button>
            </div>
          ) : customers.length > 0 ? (
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
                      <td className="table-cell">{customer.address || 'N/A'}</td>
                      <td className="table-cell">
                        <button
                          onClick={() => handleMenuNavigation('add')}
                          className="btn-link btn-blue-link"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
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
            <p className="empty-message">
              No customers available. Add a customer to see them listed here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}