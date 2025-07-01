import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchVendorInvoice({ handleBack, onBack }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  useEffect(() => {
    fetchAllInvoices();
  }, []);

  const fetchAllInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://ecommerce-lce3.onrender.com/api/vendor-invoices', {
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
      setError(err.message || 'Failed to fetch invoices');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const term = searchTerm.trim();
      let url = 'https://ecommerce-lce3.onrender.com/api/vendor-invoices';
      if (term) {
        if (/^INV\d+$/i.test(term)) {
          url = `https://ecommerce-lce3.onrender.com/api/vendor-invoices/search?vendorName=&invoiceNo=${encodeURIComponent(term)}`;
        } else if (/^\d{10}$/.test(term)) {
          url = `https://ecommerce-lce3.onrender.com/api/vendor-invoices/search?vendorName=&mobile=${encodeURIComponent(term)}`;
        } else {
          url = `https://ecommerce-lce3.onrender.com/api/vendor-invoices/search?vendorName=${encodeURIComponent(term)}`;
        }
      }
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
      setError(err.message || 'Failed to search invoices');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (invoice) => {
    try {
      const response = await fetch(`https://ecommerce-lce3.onrender.com/api/vendor-invoices/${invoice.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch invoice details');
      const invoiceData = await response.json();
      setSelectedInvoice(invoiceData);
    } catch (err) {
      alert('Failed to view invoice: ' + err.message);
    }
  };

  const InvoiceDetails = ({ invoice, onClose }) => {
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
                <p><strong>Date:</strong> {invoice.dateTime}</p>
              </div>
            </div>
            <div className="customer-info">
              <h3>Vendor Details</h3>
              <p><strong>Name:</strong> {invoice.vendorName}</p>
              <p><strong>GST Number:</strong> {invoice.vendorGstNumber || 'N/A'}</p>
              <p><strong>Mobile:</strong> {invoice.vendorPhone || 'N/A'}</p>
              <p><strong>Address:</strong> {invoice.vendorAddress || 'N/A'}</p>
            </div>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Product</th>
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
                    <td>{item.productName}</td>
                    <td>{item.category || '-'}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.unitPrice?.toFixed(2)}</td>
                    <td>{item.cgstPercent}%</td>
                    <td>{item.sgstPercent}%</td>
                    <td>₹{((item.quantity * item.unitPrice * (item.cgstPercent + item.sgstPercent)) / 100).toFixed(2)}</td>
                    <td>₹{item.total?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="totals-section">
              <p><strong>Subtotal:</strong> ₹{(invoice.subtotal)?.toFixed(2)}</p>
              <p><strong>Total Tax:</strong> ₹{(invoice.totalTax)?.toFixed(2)}</p>
              <p><strong>Grand Total:</strong> ₹{(invoice.grandTotal)?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
    @media (max-width: 600px) {
      .modal-content {
        padding: 8px;
        max-width: 98vw;
        font-size: 14px;
      }
      .invoice-container {
        padding: 8px;
      }
      .items-table th,
      .items-table td {
        padding: 4px;
        font-size: 12px;
      }
      .modal-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .form-input, .form-input-sm, textarea.form-input {
        font-size: 14px;
        padding: 6px;
      }
      .button-group {
        flex-direction: column;
        gap: 6px;
      }
      .customer-table th, .customer-table td {
        font-size: 12px;
        padding: 4px;
      }
      .table-wrapper {
        overflow-x: auto;
      }
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
      color:rgb(28, 132, 66);
    }
    .btn-link:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  `;

  const handleEdit = async (invoice) => {
    try {
      const response = await fetch(`https://ecommerce-lce3.onrender.com/api/vendor-invoices/${invoice.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch invoice details');
      const invoiceData = await response.json();
      setEditingInvoice(invoiceData);
    } catch (err) {
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
      const response = await fetch(`/api/vendor-invoices/${invoice.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete invoice');
      setSearchResults(prev => prev.filter(inv => inv.id !== invoice.id));
      alert('Invoice deleted successfully');
    } catch (err) {
      alert('Failed to delete invoice: ' + err.message);
    }
  };

  const EditInvoiceModal = ({ invoice, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      vendorName: invoice.vendorName,
      vendorPhone: invoice.vendorPhone || '',
      vendorAddress: invoice.vendorAddress || '',
      vendorGstNumber: invoice.vendorGstNumber || '',
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
      const cgst = (subtotal * item.cgstPercent) / 100;
      const sgst = (subtotal * item.sgstPercent) / 100;
      const taxAmount = cgst + sgst;
      const totalPrice = subtotal + taxAmount;
      return { taxAmount, totalPrice };
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
        updatedItems[index].total = totalPrice;
      }
      setFormData(prev => ({ ...prev, items: updatedItems }));
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
            total: parseFloat(item.total)
          })),
          grandTotal: formData.items.reduce((sum, item) => sum + parseFloat(item.total), 0)
        };
        const response = await fetch(`https://ecommerce-lce3.onrender.com/api/vendor-invoices/${invoice.id}`, {
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
            <div className="form-group">
              <label>Vendor Name</label>
              <input
                type="text"
                value={formData.vendorName}
                onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Mobile</label>
              <input
                type="text"
                value={formData.vendorPhone}
                onChange={(e) => setFormData({...formData, vendorPhone: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                value={formData.vendorGstNumber}
                onChange={(e) => setFormData({...formData, vendorGstNumber: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={formData.vendorAddress}
                onChange={(e) => setFormData({...formData, vendorAddress: e.target.value})}
                className="form-input"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Items</label>
              <div className="table-wrapper">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
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
                        <td>{item.productName}</td>
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
                        <td>{item.cgstPercent}%</td>
                        <td>{item.sgstPercent}%</td>
                        <td>₹{item.taxAmount?.toFixed(2)}</td>
                        <td>₹{item.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="totals-section">
              <p><strong>Grand Total:</strong> ₹{formData.items.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2)}</p>
            </div>
            <div className="button-group">
              <button type="submit" className="btn btn-blue">Save Changes</button>
              <button type="button" onClick={onClose} className="btn btn-gray">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handlePrint = async (invoice) => {
    try {
      const response = await fetch(`https://ecommerce-lce3.onrender.com/api/vendor-invoices/${invoice.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch invoice details');
      const invoiceData = await response.json();
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
              <p>Date: ${invoiceData.dateTime}</p>
            </div>
            <div class="customer-info">
              <h3>Vendor Details</h3>
              <p>Name: ${invoiceData.vendorName}</p>
              <p>GST Number: ${invoiceData.vendorGstNumber || ''}</p>
              <p>Mobile: ${invoiceData.vendorPhone || 'N/A'}</p>
              <p>Address: ${invoiceData.vendorAddress || 'N/A'}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
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
                    <td>${item.productName}</td>
                    <td>${item.category || '-'}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.unitPrice?.toFixed(2)}</td>
                    <td>${item.cgstPercent}%</td>
                    <td>${item.sgstPercent}%</td>
                    <td>₹${((item.quantity * item.unitPrice * (item.cgstPercent + item.sgstPercent)) / 100).toFixed(2)}</td>
                    <td>₹${item.total?.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="totals">
              <p><strong>Subtotal:</strong> ₹${(invoiceData.subtotal)?.toFixed(2)}</p>
              <p><strong>Total Tax:</strong> ₹${(invoiceData.totalTax)?.toFixed(2)}</p>
              <p><strong>Grand Total:</strong> ₹${(invoiceData.grandTotal)?.toFixed(2)}</p>
            </div>
          </body>
        </html>
      `;
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.contentWindow.document.write(printContent);
      iframe.contentWindow.document.close();
      iframe.contentWindow.onafterprint = () => {
        document.body.removeChild(iframe);
      };
      iframe.contentWindow.print();
    } catch (err) {
      alert('Failed to print invoice: ' + err.message);
    }
  };

  return (
    <div className="content-panel">
      <h2 className="section-title">Search Vendor Invoice</h2>
      <div className="search-container">
        <div className="form-group">
          <input
            type="text"
            placeholder="Search by invoice number, vendor name, or mobile..."
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
          <button
            onClick={() => {
              if (typeof handleBack === 'function') {
                handleBack();
              } else if (typeof onBack === 'function') {
                onBack();
              } else {
                navigate('/vendor-invoice');
              }
            }}
            className="btn btn-gray"
          >
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
                    <th>Vendor Name</th>
                    <th>GST Number</th>
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
                      <td>{invoice.vendorName}</td>
                      <td>{invoice.vendorGstNumber || 'N/A'}</td>
                      <td>{invoice.vendorPhone}</td>
                      <td>{invoice.dateTime}</td>
                      <td>₹{invoice.grandTotal?.toFixed(2)}</td>
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