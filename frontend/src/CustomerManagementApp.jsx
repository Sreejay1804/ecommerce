import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCustomer from './components/AddCustomer.jsx';
import AddProduct from './components/AddProduct.jsx';
import CreateInvoice from './components/CreateInvoice.jsx';
import DeleteModifyCustomer from './components/DeleteModifyCustomer.jsx';
import EnquireCustomer from './components/EnquireCustomer.jsx';
import InvoiceModule from './components/InvoiceModule.jsx';
import ManageProduct from './components/ManageProduct.jsx';
import ProductModule from './components/ProductModule';
import SearchInvoice from './components/SearchInvoice.jsx';
import SearchProduct from './components/SearchProduct.jsx';
import { useAuth } from './contexts/AuthContext';
import './CustomerManagementApp.css';

const CUSTOMER_API = 'http://localhost:8080/api/customers';
const INVOICE_API = 'http://localhost:8080/api/invoices';

export default function CustomerManagementApp() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(CUSTOMER_API);
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch(INVOICE_API);
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchInvoices();
    fetchProducts();
  }, []);

  const addCustomer = async (data) => {
    // Prevent adding if email or phone already exists in the customer list
    const emailExists = customers.some(
      (customer) => customer.email.toLowerCase() === data.email.toLowerCase()
    );
    const phoneExists = customers.some(
      (customer) => customer.phone === data.phone
    );
    if (emailExists) {
      return { success: false, error: 'A customer with this email already exists' };
    }
    if (phoneExists) {
      return { success: false, error: 'A customer with this phone number already exists' };
    }
    try {
      const res = await fetch(CUSTOMER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to add customer');
      const newCust = await res.json();
      setCustomers([...customers, newCust]);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const updateCustomer = async (id, data) => {
    try {
      const res = await fetch(`${CUSTOMER_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update customer');
      const updated = await res.json();
      setCustomers(customers.map(c => c.id === id ? updated : c));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const deleteCustomer = async (id) => {
    try {
      const res = await fetch(`${CUSTOMER_API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete customer');
      setCustomers(customers.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const searchCustomers = async (term) => {
    if (!term.trim()) return customers;
    try {
      const res = await fetch(`${CUSTOMER_API}/search?term=${encodeURIComponent(term)}`);
      if (!res.ok) throw new Error('Search failed');
      return await res.json();
    } catch (err) {
      console.error(err);
      return customers.filter(c =>
        c.name.toLowerCase().includes(term.toLowerCase()) ||
        c.email.toLowerCase().includes(term.toLowerCase())
      );
    }
  };

  const handleSaveInvoice = async (invoicePayload) => {
    try {
      const res = await fetch(INVOICE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload)
      });
      if (!res.ok) throw new Error('Failed to create invoice');
      await fetchInvoices(); // This updates the invoices state
      setActiveMenu('invoice');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const res = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (!res.ok) throw new Error('Failed to add product');
      const newProduct = await res.json();
      setProducts([...products, newProduct]);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      const res = await fetch(`http://localhost:8080/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (!res.ok) throw new Error('Failed to update product');
      const updatedProduct = await res.json();
      setProducts(products.map(p => p.id === id ? updatedProduct : p));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts(products.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const renderPanel = () => {
    switch (activeMenu) {
      case 'add':
        return (
          <AddCustomer 
            onAddCustomer={addCustomer} 
            onUpdateCustomer={updateCustomer} 
            onBack={() => {
              setActiveMenu(null);
              // Remove edit parameter from URL
              const url = new URL(window.location);
              url.searchParams.delete('edit');
              window.history.pushState(null, '', url);
            }} 
            customers={customers}
          />
        );
      case 'enquire':
        return <EnquireCustomer 
          onSearchCustomers={searchCustomers} 
          onBack={() => setActiveMenu(null)} 
        />;
      case 'delete':
        return <DeleteModifyCustomer customers={customers} onEditCustomer={() => setActiveMenu('add')} onDeleteCustomer={deleteCustomer} onBack={() => setActiveMenu(null)} />;
      case 'invoice':
        return <InvoiceModule 
          onCreate={() => setActiveMenu('createInvoice')} 
          onSearch={() => setActiveMenu('searchInvoice')} 
        />;
      case 'createInvoice':
        return (
          <CreateInvoice 
            handleBack={() => setActiveMenu('invoice')} 
            customers={customers}
            products={products} // Add this line
            onSave={handleSaveInvoice} 
          />
        );
      case 'searchInvoice':
        return <SearchInvoice handleBack={() => setActiveMenu('invoice')} invoices={invoices} />;
      case 'addProduct':
        return <AddProduct onAddProduct={handleAddProduct} onBack={() => setActiveMenu(null)} />;
      case 'manageProduct':
        return <ManageProduct products={products} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onBack={() => setActiveMenu(null)} />;
      case 'searchProduct':
        return <SearchProduct products={products} onBack={() => setActiveMenu(null)} />;
      case 'products':
        return <ProductModule />;
      default:
        return null;
    }
  };

  const renderCustomerButtons = () => {
    if (!activeMenu) {
      return (
        <div className="content-panel">
          <h2 className="section-title">Customer Management</h2>
          <div className="customer-actions-row" style={{ marginTop: '20px' }}>
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
              className="btn btn-red"
            >
              Delete/Modify Customer
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomerList = () => {
    if (activeMenu !== null) return null;

    return (
      <div className="table-container">
        <h2 className="section-subtitle">Customer List</h2>
        {loading ? (
          <p className="helper-text">Loading customers...</p>
        ) : error ? (
          <div className="error-message">
            <p>Error loading customers: {error}</p>
            <button onClick={fetchCustomers} className="btn btn-blue">Retry</button>
          </div>
        ) : customers.length > 0 ? (
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
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.address || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleEditFromList(customer)} 
                          className="btn-link btn-blue-link"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteFromList(customer)} 
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
          <p className="empty-message">No customers available. Add a customer to see them listed here.</p>
        )}
      </div>
    );
  };

  const handleEditFromList = (customer) => {
    // Update URL to include edit parameter
    const url = new URL(window.location);
    url.searchParams.set('edit', customer.id);
    window.history.pushState(null, '', url);
    
    // Switch to edit mode
    setActiveMenu('add');
  };

  const handleDeleteFromList = async (customer) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );
    
    if (confirmDelete) {
      try {
        const result = await deleteCustomer(customer.id);
        if (result.success) {
          alert('Customer deleted successfully!');
        } else {
          alert('Failed to delete customer: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        alert('An error occurred while deleting the customer');
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div>
          <div className="sidebar-header">
            <h1 
              className="sidebar-title"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                navigate('/dashboard'); // Use your dashboard route here
              }}
            >
              Dashboard
            </h1>
          </div>
          <div className="sidebar-content">
            <div className="sidebar-item">
              <button onClick={() => setActiveMenu(null)} className="sidebar-button">Customer</button>
              <button onClick={() => setActiveMenu('invoice')} className="sidebar-button">Invoice</button>
              <button 
                onClick={() => setActiveMenu('products')} 
                className={`sidebar-button ${activeMenu === 'products' ? 'active' : ''}`}
              >
                Products
              </button>
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
          {/* Then render customer buttons if we're in customer module */}
          {renderCustomerButtons()}
          {/* Finally render the customer list if we're in customer module */}
          {renderCustomerList()}
        </main>
      </div>
    </div>
  );
}
