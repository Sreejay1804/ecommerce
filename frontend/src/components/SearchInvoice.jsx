// components/SearchInvoice.jsx
import React, { useState } from 'react';

export default function SearchInvoice({ handleBack, invoices = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    const term = searchTerm.trim();
    if (!term) {
      setSearchResults([]);
      setHasSearched(true);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/invoices/search?term=${encodeURIComponent(term)}`);
      if (!response.ok) throw new Error('Failed to search invoices');
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setHasSearched(true);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/invoices/${invoiceId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete invoice');
        setSearchResults(prev => prev.filter(i => i.id !== invoiceId));
        alert('Invoice deleted successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to delete invoice');
      }
    }
  };

  return (
    <div className="content-panel">
      <h2 className="section-title">Search Invoice</h2>
      <p className="helper-text">Search for invoices by invoice number, customer name, or mobile number</p>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by invoice number, customer name, or mobile..."
          className="form-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        <div className="button-group">
          <button onClick={handleSearch} className="btn btn-blue">Search</button>
          <button onClick={handleBack} className="btn btn-gray">Back</button>
        </div>
      </div>

      {hasSearched && (
        <div className="search-results" style={{ marginTop: '24px' }}>
          <h3 className="section-subtitle">Search Results</h3>
          {searchResults.length > 0 ? (
            <div className="table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Customer Name</th>
                    <th>Mobile</th>
                    <th>Date</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map(invoice => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoiceNo}</td>
                      <td>{invoice.customerName}</td>
                      <td>{invoice.customerMobile}</td>
                      <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                      <td>₹{invoice.totalAmount.toFixed(2)}</td>
                      <td>
                        <button className="btn-link btn-blue-link" onClick={() => alert(`Viewing ${invoice.invoiceNo}`)}>View</button>
                        <button className="btn-link btn-blue-link" onClick={() => alert(`Edit ${invoice.invoiceNo}`)}>Edit</button>
                        <button className="btn-link btn-red-link" onClick={() => handleDeleteInvoice(invoice.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-message">No matching invoices found.</p>
          )}
        </div>
      )}
    </div>
  );
}
