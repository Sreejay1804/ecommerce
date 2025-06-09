import { useEffect, useState } from 'react';

export default function SearchInvoice({ handleBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Initial load of all invoices
  useEffect(() => {
    fetchAllInvoices();
  }, []);

  const fetchAllInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/invoices', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch invoices');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data received from server');
      }

      setSearchResults(data);
      setHasSearched(true);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.message || 'Failed to fetch invoices');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Update handleSearch function with better error handling
  const handleSearch = async () => {
    setLoading(true);
    setError('');
    
    try {
      const term = searchTerm.trim();
      const url = term ? 
        `http://localhost:8080/api/invoices/search?term=${encodeURIComponent(term)}` :
        'http://localhost:8080/api/invoices';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch invoices');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data received from server');
      }

      setSearchResults(data);
      setHasSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search invoices');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Update the handleView function
  const handleView = async (invoice) => {
    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${invoice.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch invoice details');
      const invoiceData = await response.json();
      setSelectedInvoice(invoiceData);
    } catch (err) {
      console.error('Error viewing invoice:', err);
      alert('Failed to view invoice: ' + err.message);
    }
  };

  // Add this component for invoice details view
  const InvoiceDetails = ({ invoice, onClose }) => {
    const formattedDate = new Date(invoice.invoiceDate).toLocaleDateString('en-IN');
    
    return (
      <div className="invoice-details-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Invoice Details</h2>
            <button onClick={onClose} className="close-btn">&times;</button>
          </div>
          
          <div className="invoice-container">
            <div className="invoice-header">
              <div className="invoice-info">
                <p><strong>Invoice No:</strong> {invoice.invoiceNo}</p>
                <p><strong>Date:</strong> {formattedDate}</p>
              </div>
            </div>

            <div className="customer-info">
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> {invoice.customerName}</p>
              <p><strong>Mobile:</strong> {invoice.customerMobile || 'N/A'}</p>
              <p><strong>Address:</strong> {invoice.customerAddress || 'N/A'}</p>
            </div>

            <table className="items-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>CGST</th>
                  <th>SGST</th>
                  <th>Tax Amount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.itemName}</td>
                    <td>{item.category || '-'}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unitPrice.toFixed(2)}</td>
                    <td>{item.cgstRate}%</td>
                    <td>{item.sgstRate}%</td>
                    <td>₹{item.taxAmount.toFixed(2)}</td>
                    <td>₹{item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="totals-section">
              <p><strong>Subtotal:</strong> ₹{(invoice.totalAmount - invoice.items.reduce((sum, item) => sum + item.taxAmount, 0)).toFixed(2)}</p>
              <p><strong>Total Tax:</strong> ₹{invoice.items.reduce((sum, item) => sum + item.taxAmount, 0).toFixed(2)}</p>
              <p><strong>Grand Total:</strong> ₹{invoice.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add these styles to your CSS
  const styles = `
    .invoice-details-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 20px;
      overflow-y: auto;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 100%;
      max-width: 1000px;
      position: relative;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0 8px;
    }

    .invoice-container {
      padding: 20px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    .items-table th,
    .items-table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    .items-table th {
      background-color: #4f46e5;
      color: white;
    }

    .totals-section {
      margin-top: 20px;
      text-align: right;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    .form-input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    select.form-input {
      background-color: white;
    }

    .button-group {
      display: flex;
      gap: 8px;
      justify-content: left;
    }

    .btn-link {
      background: none;
      border: none;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 14px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .btn-blue-link {
      color: #3b82f6;
    }

    .btn-red-link {
      color: #dc2626;
    }

    .btn-green-link {
      color:rgb(28, 132, 66);  // Green color
    }

    .btn-link:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  `;

  const handleEdit = async (invoice) => {
    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${invoice.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch invoice details');
      const invoiceData = await response.json();
      setEditingInvoice(invoiceData);
    } catch (err) {
      console.error('Error editing invoice:', err);
      alert('Failed to edit invoice: ' + err.message);
    }
  };

  const handleSaveEdit = async (updatedInvoice) => {
    setSearchResults(prev => 
      prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv)
    );
    alert('Invoice updated successfully');
  };

  const handleDelete = async (invoice) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${invoice.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete invoice');

      // Remove deleted invoice from results
      setSearchResults(prev => prev.filter(inv => inv.id !== invoice.id));
      alert('Invoice deleted successfully');
    } catch (err) {
      alert('Failed to delete invoice: ' + err.message);
    }
  };

  const EditInvoiceModal = ({ invoice, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      customerName: invoice.customerName,
      customerMobile: invoice.customerMobile || '',
      customerAddress: invoice.customerAddress || '',
      items: invoice.items.map(item => ({
        ...item,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString()
      }))
    });

    const calculateItemTotals = (item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const subtotal = quantity * unitPrice;
      const cgst = (subtotal * item.cgstRate) / 100;
      const sgst = (subtotal * item.sgstRate) / 100;
      const taxAmount = cgst + sgst;
      const totalPrice = subtotal + taxAmount;

      return {
        taxAmount,
        totalPrice
      };
    };

    const handleItemChange = (index, field, value) => {
      const updatedItems = [...formData.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };

      if (field === 'quantity' || field === 'unitPrice') {
        const { taxAmount, totalPrice } = calculateItemTotals(updatedItems[index]);
        updatedItems[index].taxAmount = taxAmount;
        updatedItems[index].totalPrice = totalPrice;
      }

      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const payload = {
          ...invoice,
          ...formData,
          items: formData.items.map(item => ({
            ...item,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            taxAmount: parseFloat(item.taxAmount),
            totalPrice: parseFloat(item.totalPrice)
          })),
          totalAmount: formData.items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
        };

        const response = await fetch(`http://localhost:8080/api/invoices/${invoice.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to update invoice');
        
        const updatedInvoice = await response.json();
        onSave(updatedInvoice);
        onClose();
      } catch (err) {
        alert('Failed to update invoice: ' + err.message);
      }
    };

    return (
      <div className="invoice-details-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Edit Invoice #{invoice.invoiceNo}</h2>
            <button onClick={onClose} className="close-btn">&times;</button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Customer fields */}
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Mobile</label>
              <input
                type="text"
                value={formData.customerMobile}
                onChange={(e) => setFormData({...formData, customerMobile: e.target.value})}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                value={formData.customerAddress}
                onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
                className="form-input"
                rows="3"
              />
            </div>

            {/* Items table */}
            <div className="form-group">
              <label>Items</label>
              <div className="table-wrapper">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>CGST %</th>
                      <th>SGST %</th>
                      <th>Tax Amount</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.itemName}</td>
                        <td>{item.category}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="form-input-sm"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="form-input-sm"
                          />
                        </td>
                        <td>{item.cgstRate}%</td>
                        <td>{item.sgstRate}%</td>
                        <td>₹{item.taxAmount.toFixed(2)}</td>
                        <td>₹{item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="totals-section">
              <p><strong>Grand Total:</strong> ₹{formData.items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0).toFixed(2)}</p>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-blue">
                Save Changes
              </button>
              <button type="button" onClick={onClose} className="btn btn-gray">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handlePrint = async (invoice) => {
    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${invoice.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch invoice details');
      const invoiceData = await response.json();
      
      const formattedDate = new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN');
      
      // Create hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Generate print content
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice #${invoiceData.invoiceNo}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .invoice-header { margin-bottom: 20px; }
              .customer-info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f8f9fa; }
              .totals { margin-top: 20px; text-align: right; }
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-header">
              <h2>Invoice #${invoiceData.invoiceNo}</h2>
              <p>Date: ${formattedDate}</p>
            </div>
            
            <div class="customer-info">
              <h3>Customer Details</h3>
              <p>Name: ${invoiceData.customerName}</p>
              <p>Mobile: ${invoiceData.customerMobile || 'N/A'}</p>
              <p>Address: ${invoiceData.customerAddress || 'N/A'}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>CGST %</th>
                  <th>SGST %</th>
                  <th>Tax Amount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.items.map(item => `
                  <tr>
                    <td>${item.itemName}</td>
                    <td>${item.category || '-'}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.unitPrice.toFixed(2)}</td>
                    <td>${item.cgstRate}%</td>
                    <td>${item.sgstRate}%</td>
                    <td>₹${item.taxAmount.toFixed(2)}</td>
                    <td>₹${item.totalPrice.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <p><strong>Subtotal:</strong> ₹${(invoiceData.totalAmount - invoiceData.items.reduce((sum, item) => sum + item.taxAmount, 0)).toFixed(2)}</p>
              <p><strong>Total Tax:</strong> ₹${invoiceData.items.reduce((sum, item) => sum + item.taxAmount, 0).toFixed(2)}</p>
              <p><strong>Grand Total:</strong> ₹${invoiceData.totalAmount.toFixed(2)}</p>
            </div>
          </body>
        </html>
      `;

      // Write to iframe and print
      iframe.contentWindow.document.write(printContent);
      iframe.contentWindow.document.close();

      iframe.contentWindow.onafterprint = () => {
        // Remove iframe after printing
        document.body.removeChild(iframe);
      };

      iframe.contentWindow.print();
    } catch (err) {
      console.error('Error printing invoice:', err);
      alert('Failed to print invoice: ' + err.message);
    }
  };

  return (
    <div className="content-panel">
      <h2 className="section-title">Search Invoice</h2>
      
      <div className="search-container">
        <div className="form-group">
          <input
            type="text"
            placeholder="Search by invoice number, customer name, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
          <button onClick={handleBack} className="btn btn-gray">
            Back
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-message">Loading invoices...</div>
      ) : hasSearched && (
        <div className="search-results">
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
                  {searchResults.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoiceNo}</td>
                      <td>{invoice.customerName}</td>
                      <td>{invoice.customerMobile}</td>
                      <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                      <td>₹{invoice.totalAmount.toFixed(2)}</td>
                      <td>
                        <div className="button-group">
                          <button
                            onClick={() => handleView(invoice)}
                            className="btn-link btn-blue-link"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="btn-link btn-blue-link"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handlePrint(invoice)}
                            className="btn-link btn-green-link"
                          >
                            Print
                          </button>
                          <button
                            onClick={() => handleDelete(invoice)}
                            className="btn-link btn-red-link"
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
            <p className="empty-message">No invoices found.</p>
          )}
        </div>
      )}

      {selectedInvoice && (
        <InvoiceDetails 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}

      {editingInvoice && (
        <EditInvoiceModal
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
          onSave={(updatedInvoice) => {
            setSearchResults(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
            setEditingInvoice(null);
          }}
        />
      )}

      <style>{styles}</style>
    </div>
  );
}