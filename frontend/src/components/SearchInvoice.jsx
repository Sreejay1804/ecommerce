// components/SearchInvoice.jsx
import { useState } from 'react';

export default function SearchInvoice({ handleBack, invoices = [], setActiveMenu }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleSearch = async () => {
    const term = searchTerm.trim();
    try {
      let response, data;
      if (!term) {
        // Fetch all invoices if no search term
        response = await fetch('http://localhost:8080/api/invoices');
        if (!response.ok) throw new Error('Failed to fetch invoices');
        data = await response.json();
      } else {
        response = await fetch(`http://localhost:8080/api/invoices/search?term=${encodeURIComponent(term)}`);
        if (!response.ok) throw new Error('Failed to search invoices');
        data = await response.json();
      }
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

  const handleViewInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${invoiceId}`);
      if (!response.ok) throw new Error('Failed to fetch invoice details');
      const data = await response.json();
      setSelectedInvoice(data);
      setViewMode(true);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch invoice details');
    }
  };

  const handleEditInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${invoiceId}`);
      if (!response.ok) throw new Error('Failed to fetch invoice details');
      const data = await response.json();
      setSelectedInvoice(data);
      setEditMode(true);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch invoice details');
    }
  };

  const handleUpdateInvoice = async (updatedInvoice) => {
    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${updatedInvoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInvoice)
      });

      if (!response.ok) throw new Error('Failed to update invoice');
      const data = await response.json();
      
      setSearchResults(prev => 
        prev.map(inv => inv.id === data.id ? data : inv)
      );
      setEditMode(false);
      setSelectedInvoice(null);
      alert('Invoice updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update invoice');
    }
  };

  const InvoiceDetails = ({ invoice }) => (
    <div className="invoice-details">
      <h3>Invoice Details</h3>
      <div className="invoice-header">
        <div className="invoice-info">
          <p><strong>Invoice No:</strong> {invoice.invoiceNo}</p>
          <p><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
        </div>
        <div className="customer-info">
          <p><strong>Customer Name:</strong> {invoice.customerName}</p>
          <p><strong>Mobile:</strong> {invoice.customerMobile}</p>
          <p><strong>Address:</strong> {invoice.customerAddress}</p>
        </div>
      </div>

      <div className="items-table">
        <h4>Items</h4>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>CGST (%)</th>
              <th>SGST (%)</th>
              <th>Tax Amount</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.itemName}</td>
                <td>{item.itemCategory}</td>
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
      </div>

      <div className="invoice-summary">
        <p><strong>Sub Total:</strong> ₹{invoice.items.reduce((sum, item) => 
          sum + (item.quantity * item.unitPrice), 0).toFixed(2)}</p>
        <p><strong>Total Tax:</strong> ₹{invoice.items.reduce((sum, item) => 
          sum + item.taxAmount, 0).toFixed(2)}</p>
        <p><strong>Grand Total:</strong> ₹{invoice.totalAmount.toFixed(2)}</p>
        <p><strong>Payment Status:</strong> {invoice.paymentStatus}</p>
      </div>

      <div className="button-group">
        <button onClick={() => setViewMode(false)} className="btn btn-gray">Back to Search</button>
        <button onClick={() => window.print()} className="btn btn-blue">Print Invoice</button>
      </div>
    </div>
  );

  const InvoiceForm = ({ invoice, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ ...invoice });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="invoice-form">
        <h3>{invoice.id ? 'Edit Invoice' : 'New Invoice'}</h3>
        <div className="form-group">
          <label>Invoice No</label>
          <input 
            type="text" 
            name="invoiceNo" 
            value={formData.invoiceNo} 
            onChange={handleChange} 
            className="form-input"
            readOnly={!!invoice.id}
          />
        </div>
        <div className="form-group">
          <label>Customer Name</label>
          <input 
            type="text" 
            name="customerName" 
            value={formData.customerName} 
            onChange={handleChange} 
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label>Mobile</label>
          <input 
            type="text" 
            name="customerMobile" 
            value={formData.customerMobile} 
            onChange={handleChange} 
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea 
            name="customerAddress" 
            value={formData.customerAddress} 
            onChange={handleChange} 
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Items</label>
          {formData.items.map((item, index) => (
            <div key={index} className="item-row">
              <input 
                type="text" 
                name="itemName" 
                value={item.itemName} 
                onChange={e => {
                  const newItems = [...formData.items];
                  newItems[index].itemName = e.target.value;
                  setFormData(prev => ({ ...prev, items: newItems }));
                }} 
                className="form-input"
                placeholder="Item Name"
                required
              />
              <input 
                type="text" 
                name="itemCategory" 
                value={item.itemCategory} 
                onChange={e => {
                  const newItems = [...formData.items];
                  newItems[index].itemCategory = e.target.value;
                  setFormData(prev => ({ ...prev, items: newItems }));
                }} 
                className="form-input"
                placeholder="Category"
                required
              />
              <input 
                type="number" 
                name="quantity" 
                value={item.quantity} 
                onChange={e => {
                  const newItems = [...formData.items];
                  newItems[index].quantity = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, items: newItems }));
                }} 
                className="form-input"
                placeholder="Quantity"
                required
              />
              <input 
                type="number" 
                name="unitPrice" 
                value={item.unitPrice} 
                onChange={e => {
                  const newItems = [...formData.items];
                  newItems[index].unitPrice = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, items: newItems }));
                }} 
                className="form-input"
                placeholder="Unit Price"
                required
              />
              <input 
                type="number" 
                name="cgstRate" 
                value={item.cgstRate} 
                onChange={e => {
                  const newItems = [...formData.items];
                  newItems[index].cgstRate = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, items: newItems }));
                }} 
                className="form-input"
                placeholder="CGST (%)"
                required
              />
              <input 
                type="number" 
                name="sgstRate" 
                value={item.sgstRate} 
                onChange={e => {
                  const newItems = [...formData.items];
                  newItems[index].sgstRate = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, items: newItems }));
                }} 
                className="form-input"
                placeholder="SGST (%)"
                required
              />
              <input 
                type="number" 
                name="taxAmount" 
                value={item.taxAmount} 
                onChange={e => {
                  const newItems = [...formData.items];
                  newItems[index].taxAmount = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, items: newItems }));
                }} 
                className="form-input"
                placeholder="Tax Amount"
                required
              />
              <input 
                type="number" 
                name="totalPrice" 
                value={item.totalPrice} 
                onChange={e => {
                  const newItems = [...formData.items];
                  newItems[index].totalPrice = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, items: newItems }));
                }} 
                className="form-input"
                placeholder="Total"
                required
              />
              <button 
                type="button" 
                onClick={() => {
                  const newItems = formData.items.filter((_, i) => i !== index);
                  setFormData(prev => ({ ...prev, items: newItems }));
                }} 
                className="btn btn-red"
                style={{ marginLeft: '8px' }}
              >
                Remove
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                items: [...prev.items, {
                  itemName: '',
                  itemCategory: '',  // Changed from itemDescription to itemCategory
                  quantity: 1,
                  unitPrice: 0,
                  cgstRate: 0,
                  sgstRate: 0,
                  taxAmount: 0,
                  totalPrice: 0
                }]
              }));
            }} 
            className="btn btn-green"
            style={{ marginTop: '8px' }}
          >
            Add Item
          </button>
        </div>

        <div className="form-group">
          <label>Payment Status</label>
          <select 
            name="paymentStatus" 
            value={formData.paymentStatus} 
            onChange={handleChange} 
            className="form-input"
            required
          >
            <option value="">Select Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-blue">
            {invoice.id ? 'Update Invoice' : 'Create Invoice'}
          </button>
          <button onClick={onCancel} className="btn btn-gray">Cancel</button>
        </div>
      </form>
    );
  };

  const EditInvoice = ({ invoice }) => {
    const [editedInvoice, setEditedInvoice] = useState({ ...invoice });

    const handleInputChange = (e, field) => {
      setEditedInvoice(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    };

    const handleItemChange = (index, field, value) => {
      const updatedItems = [...editedInvoice.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };

      // Recalculate totals
      const item = updatedItems[index];
      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(item.unitPrice);
      const cgstRate = parseFloat(item.cgstRate);
      const sgstRate = parseFloat(item.sgstRate);

      const subtotal = quantity * unitPrice;
      const taxAmount = subtotal * ((cgstRate + sgstRate) / 100);
      const totalPrice = subtotal + taxAmount;

      updatedItems[index] = {
        ...item,
        taxAmount,
        totalPrice
      };

      setEditedInvoice(prev => ({
        ...prev,
        items: updatedItems,
        totalAmount: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
      }));
    };

    return (
      <div className="edit-invoice">
        <h3>Edit Invoice</h3>
        
        <div className="form-group">
          <label>Invoice No:</label>
          <input
            type="text"
            value={editedInvoice.invoiceNo}
            onChange={(e) => handleInputChange(e, 'invoiceNo')}
          />
        </div>

        <div className="form-group">
          <label>Customer Name:</label>
          <input
            type="text"
            value={editedInvoice.customerName}
            onChange={(e) => handleInputChange(e, 'customerName')}
          />
        </div>

        <div className="form-group">
          <label>Customer Mobile:</label>
          <input
            type="text"
            value={editedInvoice.customerMobile}
            onChange={(e) => handleInputChange(e, 'customerMobile')}
          />
        </div>

        <div className="form-group">
          <label>Customer Address:</label>
          <textarea
            value={editedInvoice.customerAddress}
            onChange={(e) => handleInputChange(e, 'customerAddress')}
          />
        </div>

        <div className="items-section">
          <h4>Items</h4>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>CGST (%)</th>
                <th>SGST (%)</th>
                <th>Tax Amount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {editedInvoice.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.itemCategory}
                      onChange={(e) => handleItemChange(index, 'itemCategory', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.cgstRate}
                      onChange={(e) => handleItemChange(index, 'cgstRate', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.sgstRate}
                      onChange={(e) => handleItemChange(index, 'sgstRate', e.target.value)}
                    />
                  </td>
                  <td>₹{item.taxAmount.toFixed(2)}</td>
                  <td>₹{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-summary">
          <p><strong>Total Amount:</strong> ₹{editedInvoice.totalAmount.toFixed(2)}</p>
        </div>

        <div className="button-group">
          <button onClick={() => setEditMode(false)} className="btn btn-gray">
            Cancel
          </button>
          <button 
            onClick={() => handleUpdateInvoice(editedInvoice)} 
            className="btn btn-blue"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  };

  if (editMode && selectedInvoice) {
    return <EditInvoice invoice={selectedInvoice} />;
  }

  if (viewMode && selectedInvoice) {
    return <InvoiceDetails invoice={selectedInvoice} />;
  }

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
          <button onClick={() => { handleBack(); setActiveMenu('searchInvoice'); }} className="btn btn-gray">Back</button>
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
                        <button 
                          className="btn-link btn-blue-link" 
                          onClick={() => handleViewInvoice(invoice.id)}
                        >
                          View
                        </button>
                        <button 
                          className="btn-link btn-blue-link" 
                          onClick={() => handleEditInvoice(invoice.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-link btn-red-link" 
                          onClick={() => handleDeleteInvoice(invoice.id)}
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
            <p className="empty-message">No matching invoices found.</p>
          )}
        </div>
      )}
    </div>
  );
}