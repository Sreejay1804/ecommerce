import { useEffect, useState } from 'react';

export default function SearchVendorInvoice({ onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter invoices based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInvoices(invoices);
    } else {
      const filtered = invoices.filter(invoice =>
        invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.vendorPhone.includes(searchTerm)
      );
      setFilteredInvoices(filtered);
    }
  }, [searchTerm, invoices]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/vendor-invoices');
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      
      const data = await response.json();
      setInvoices(data || []);
      setFilteredInvoices(data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Unable to fetch invoices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by useEffect above
  };

  const handleView = (invoiceId) => {
    // TODO: Implement view functionality
    console.log('View invoice:', invoiceId);
    alert('View functionality will be implemented soon');
  };

  const handleEdit = (invoiceId) => {
    // TODO: Implement edit functionality
    console.log('Edit invoice:', invoiceId);
    alert('Edit functionality will be implemented soon');
  };

  const handlePrint = (invoiceId) => {
    // TODO: Implement print functionality
    console.log('Print invoice:', invoiceId);
    alert('Print functionality will be implemented soon');
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vendor-invoices/${invoiceId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      // Remove the deleted invoice from the state
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      alert('Invoice deleted successfully');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      alert('Failed to delete invoice. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    try {
      // If it's already in DD/MM/YYYY format, return as is
      if (dateString.includes('/')) {
        return dateString;
      }
      
      // Otherwise, format from ISO string
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    } catch (err) {
      return dateString; // Return original if parsing fails
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toFixed(2)}`;
  };

  return (
    <div className="content-panel">
      <h2 className="section-title">Search Invoice</h2>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice number, vendor name, or mobile..."
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button 
            type="submit"
            className="btn btn-blue"
            style={{ padding: '10px 20px' }}
          >
            Search
          </button>
          <button 
            type="button"
            onClick={onBack}
            className="btn"
            style={{
              padding: '10px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Back
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Loading invoices...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          background: '#fee',
          color: '#c00',
          padding: '12px',
          marginBottom: '16px',
          borderRadius: '4px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {/* Invoices Table */}
      {!loading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table className="customer-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Vendor Name</th>
                <th>Mobile</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoiceNo}</td>
                    <td>{invoice.vendorName}</td>
                    <td>{invoice.vendorPhone}</td>
                    <td>{formatDate(invoice.dateTime)}</td>
                    <td>{formatCurrency(invoice.grandTotal)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleView(invoice.id)}
                          className="btn-link"
                          style={{
                            color: '#007bff',
                            textDecoration: 'underline',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px'
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(invoice.id)}
                          className="btn-link"
                          style={{
                            color: '#28a745',
                            textDecoration: 'underline',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePrint(invoice.id)}
                          className="btn-link"
                          style={{
                            color: '#6f42c1',
                            textDecoration: 'underline',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px'
                          }}
                        >
                          Print
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="btn-link"
                          style={{
                            color: '#dc3545',
                            textDecoration: 'underline',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    {searchTerm ? 'No invoices found matching your search.' : 'No invoices available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Results Summary */}
      {!loading && !error && filteredInvoices.length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
          <p>
            Showing {filteredInvoices.length} of {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      )}
    </div>
  );
}