import { useEffect, useState } from 'react';
import './CustomerManagementApp.css';
import AddCustomer from './components/AddCustomer.jsx';
import DeleteModifyCustomer from './components/DeleteModifyCustomer.jsx';
import EnquireCustomer from './components/EnquireCustomer.jsx';
import CreateInvoice from './components/CreateInvoice.jsx';
import SearchInvoice from './components/SearchInvoice.jsx';
import InvoiceModule from './components/InvoiceModule.jsx';

const CUSTOMER_API = 'http://localhost:8080/api/customers';
const INVOICE_API = 'http://localhost:8080/api/invoices';

export default function CustomerManagementApp() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
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

  useEffect(() => {
    fetchCustomers();
    fetchInvoices();
  }, []);

  const addCustomer = async (data) => {
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
      await fetchInvoices();
      setActiveMenu('invoice');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const renderPanel = () => {
    switch (activeMenu) {
      case 'add':
        return <AddCustomer onAddCustomer={addCustomer} onUpdateCustomer={updateCustomer} onBack={() => setActiveMenu(null)} customers={customers} />;
      case 'enquire':
        return <EnquireCustomer onSearchCustomers={searchCustomers} onEditCustomer={() => setActiveMenu('add')} onDeleteCustomer={deleteCustomer} onBack={() => setActiveMenu(null)} />;
      case 'delete':
        return <DeleteModifyCustomer customers={customers} onEditCustomer={() => setActiveMenu('add')} onDeleteCustomer={deleteCustomer} onBack={() => setActiveMenu(null)} />;
      case 'invoice':
        return <InvoiceModule handleBack={() => setActiveMenu(null)} onCreate={() => setActiveMenu('createInvoice')} onSearch={() => setActiveMenu('searchInvoice')} />;
      case 'createInvoice':
        return <CreateInvoice handleBack={() => setActiveMenu('invoice')} customers={customers} onSave={handleSaveInvoice} />;
      case 'searchInvoice':
        return <SearchInvoice handleBack={() => setActiveMenu('invoice')} invoices={invoices} />;
      default:
        return (
          <div className="options-container">
            <h2 className="section-title">Management Options</h2>
            <div className="options-grid">
              <button onClick={() => setActiveMenu('add')} className="btn btn-blue">Add Customer</button>
              <button onClick={() => setActiveMenu('enquire')} className="btn btn-green">Enquire Customer</button>
              <button onClick={() => setActiveMenu('delete')} className="btn btn-purple">Delete/Modify Customer</button>
              <button onClick={() => setActiveMenu('invoice')} className="btn btn-blue">Invoice Module</button>
            </div>
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
            <button onClick={() => setActiveMenu(null)} className="sidebar-button">Customer</button>
            <button onClick={() => setActiveMenu('invoice')} className="sidebar-button">Invoice</button>
          </div>
        </div>
      </div>

      <div className="main-container">
        <main className="main-content">{renderPanel()}</main>

        <div className="table-container">
          <h2 className="section-title">Customer List</h2>
          {loading ? <p className="helper-text">Loading customers...</p> : error ? (
            <div className="error-message">
              <p>Error loading customers: {error}</p>
              <button onClick={fetchCustomers} className="btn btn-blue">Retry</button>
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
                  {customers.map(customer => (
                    <tr key={customer.id}>
                      <td className="table-cell">{customer.name}</td>
                      <td className="table-cell">{customer.email}</td>
                      <td className="table-cell">{customer.phone}</td>
                      <td className="table-cell">{customer.address || 'N/A'}</td>
                      <td className="table-cell">
                        <button onClick={() => setActiveMenu('add')} className="btn-link btn-blue-link">Edit</button>
                        <button onClick={() => deleteCustomer(customer.id)} className="btn-link btn-red-link">Delete</button>
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
