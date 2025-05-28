// components/CreateInvoice.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function CreateInvoice({ handleBack, customers }) {
  const [invoiceData, setInvoiceData] = useState({
    customerName: '',
    address: '',
    mobile: '',
    invoiceNo: '',
    dateTime: new Date().toISOString().slice(0, 16)
  });

  const [products, setProducts] = useState([
    { sno: 1, itemName: '', category: '', quantity: '', unitPrice: '', cgst: '', sgst: '', tax: '', total: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generate invoice number on component mount
  useEffect(() => {
    generateInvoiceNumber();
  }, []);

  const generateInvoiceNumber = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/generate-number`);
      if (response.ok) {
        const invoiceNumber = await response.text();
        setInvoiceData(prev => ({ ...prev, invoiceNo: invoiceNumber }));
      }
    } catch (error) {
      console.error('Error generating invoice number:', error);
    }
  };

  const checkInvoiceNumberExists = async (invoiceNo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/check-invoice-no?invoiceNo=${encodeURIComponent(invoiceNo)}`);
      if (response.ok) {
        const result = await response.json();
        return result.exists;
      }
    } catch (error) {
      console.error('Error checking invoice number:', error);
    }
    return false;
  };

  const handleInvoiceInputChange = async (e) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });

    // Check if invoice number already exists when user types
    if (name === 'invoiceNo' && value.trim()) {
      const exists = await checkInvoiceNumberExists(value.trim());
      if (exists) {
        setError('Invoice number already exists. Please use a different number.');
      } else {
        setError('');
      }
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;

    // Auto-calculate totals when quantity, unit price, CGST, SGST change
    if (['quantity', 'unitPrice', 'cgst', 'sgst'].includes(field)) {
      const product = updatedProducts[index];
      const qty = parseFloat(product.quantity) || 0;
      const price = parseFloat(product.unitPrice) || 0;
      const cgst = parseFloat(product.cgst) || 0;
      const sgst = parseFloat(product.sgst) || 0;

      const subtotal = qty * price;
      const cgstAmount = (subtotal * cgst) / 100;
      const sgstAmount = (subtotal * sgst) / 100;
      const tax = cgstAmount + sgstAmount;
      const total = subtotal + tax;

      updatedProducts[index].tax = tax.toFixed(2);
      updatedProducts[index].total = total.toFixed(2);
    }

    setProducts(updatedProducts);
  };

  const addProductRow = () => {
    setProducts([...products, {
      sno: products.length + 1,
      itemName: '',
      category: '',
      quantity: '',
      unitPrice: '',
      cgst: '',
      sgst: '',
      tax: '',
      total: ''
    }]);
  };

  const removeProductRow = (index) => {
    if (products.length > 1) {
      const updatedProducts = products.filter((_, i) => i !== index);
      // Update serial numbers
      updatedProducts.forEach((product, i) => {
        product.sno = i + 1;
      });
      setProducts(updatedProducts);
    }
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    if (customerId) {
      const customer = customers.find(c => c.id.toString() === customerId);
      if (customer) {
        setInvoiceData({
          ...invoiceData,
          customerName: customer.name,
          address: customer.address,
          mobile: customer.phone
        });
      }
    } else {
      setInvoiceData({
        ...invoiceData,
        customerName: '',
        address: '',
        mobile: ''
      });
    }
  };

  const calculateGrandTotal = () => {
    return products.reduce((sum, product) => sum + (parseFloat(product.total) || 0), 0).toFixed(2);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!invoiceData.customerName.trim()) {
      errors.push('Customer name is required');
    }
    
    if (!invoiceData.invoiceNo.trim()) {
      errors.push('Invoice number is required');
    }
    
    if (!invoiceData.dateTime) {
      errors.push('Date and time is required');
    }

    // Validate at least one product with required fields
    const validProducts = products.filter(p => 
      p.itemName.trim() && 
      p.quantity && 
      parseFloat(p.quantity) > 0 && 
      p.unitPrice && 
      parseFloat(p.unitPrice) > 0
    );

    if (validProducts.length === 0) {
      errors.push('At least one item with name, quantity, and unit price is required');
    }

    return errors;
  };

  // FIXED: Function to prepare invoice items for backend with correct field names
  const prepareInvoiceItems = () => {
    return products
      .filter(p => 
        p.itemName.trim() && 
        p.quantity && 
        parseFloat(p.quantity) > 0 && 
        p.unitPrice && 
        parseFloat(p.unitPrice) > 0
      )
      .map(product => ({
        itemName: product.itemName.trim(),
        category: product.category.trim() || null,
        quantity: parseInt(product.quantity),
        unitPrice: parseFloat(product.unitPrice),
        cgstRate: parseFloat(product.cgst) || 0,
        sgstRate: parseFloat(product.sgst) || 0,
        // Backend will calculate these automatically
        cgstAmount: ((parseFloat(product.unitPrice) * parseInt(product.quantity)) * (parseFloat(product.cgst) || 0)) / 100,
        sgstAmount: ((parseFloat(product.unitPrice) * parseInt(product.quantity)) * (parseFloat(product.sgst) || 0)) / 100,
        taxAmount: parseFloat(product.tax) || 0,
        totalPrice: parseFloat(product.total) || 0
      }));
  };

  const handleSaveInvoice = async () => {
    setError('');
    setSuccess('');
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);

    try {
      // FIXED: Include invoice items in the payload with correct field names
      const invoicePayload = {
        customerName: invoiceData.customerName.trim(),
        customerAddress: invoiceData.address.trim(),
        customerMobile: invoiceData.mobile.trim(),
        invoiceNo: invoiceData.invoiceNo.trim(),
        invoiceDate: new Date(invoiceData.dateTime).toISOString(),
        totalAmount: parseFloat(calculateGrandTotal()),
        paymentStatus: 'PENDING',
        items: prepareInvoiceItems() // FIXED: Using correct field mapping
      };

      console.log('Sending invoice payload:', invoicePayload); // Debug log

      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoicePayload)
      });

      if (response.ok) {
        const savedInvoice = await response.json();
        setSuccess(`Invoice ${savedInvoice.invoiceNo} created successfully!`);
        
        // Reset form after successful save
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Backend error response:', errorData); // Debug log
        setError(errorData.message || errorData.error || 'Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setInvoiceData({
      customerName: '',
      address: '',
      mobile: '',
      invoiceNo: '',
      dateTime: new Date().toISOString().slice(0, 16)
    });
    setProducts([
      { sno: 1, itemName: '', category: '', quantity: '', unitPrice: '', cgst: '', sgst: '', tax: '', total: '' }
    ]);
    generateInvoiceNumber();
    setError('');
    setSuccess('');
  };

  return (
    <div className="content-panel">
      <h2 className="section-title">Create Invoice</h2>
      
      {/* Error and Success Messages */}
      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          border: '1px solid #fca5a5', 
          color: '#dc2626', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          backgroundColor: '#d1fae5', 
          border: '1px solid #86efac', 
          color: '#059669', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          {success}
        </div>
      )}
      
      {/* Invoice Header */}
      <div className="invoice-header" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div>
          <div className="form-group">
            <label className="form-label">Select Customer</label>
            <select 
              className="form-input"
              onChange={handleCustomerSelect}
              disabled={loading}
            >
              <option value="">Select a customer or enter manually</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Customer Name <span className="required">*</span></label>
            <input
              type="text"
              name="customerName"
              value={invoiceData.customerName}
              onChange={handleInvoiceInputChange}
              className="form-input"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              value={invoiceData.address}
              onChange={handleInvoiceInputChange}
              className="form-input"
              rows="3"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={invoiceData.mobile}
              onChange={handleInvoiceInputChange}
              className="form-input"
              disabled={loading}
            />
          </div>
        </div>
        
        <div>
          <div className="form-group">
            <label className="form-label">Invoice No <span className="required">*</span></label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                name="invoiceNo"
                value={invoiceData.invoiceNo}
                onChange={handleInvoiceInputChange}
                className="form-input"
                required
                disabled={loading}
              />
              <button 
                onClick={generateInvoiceNumber}
                className="btn btn-gray"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                disabled={loading}
              >
                Generate
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Date & Time <span className="required">*</span></label>
            <input
              type="datetime-local"
              name="dateTime"
              value={invoiceData.dateTime}
              onChange={handleInvoiceInputChange}
              className="form-input"
              required
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="invoice-table-container">
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="section-subtitle">Products/Services</h3>
          <button 
            onClick={addProductRow} 
            className="btn btn-green" 
            style={{ fontSize: '14px', padding: '6px 12px' }}
            disabled={loading}
          >
            Add Row
          </button>
        </div>
        
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="invoice-table" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#4f46e5', color: 'white' }}>
                <th style={{ padding: '12px 8px', border: '1px solid #e5e7eb', textAlign: 'left', minWidth: '50px' }}>Sno</th>
                <th style={{ padding: '12px 8px', border: '1px solid #e5e7eb', textAlign: 'left', minWidth: '150px' }}>Item Name</th>
                <th style={{ padding: '12px 8px', border: '1px solid #e5e7eb', textAlign: 'left', minWidth: '120px' }}>Category</th>
                <th style={{ padding: '12px 8px', border: '1px solid #e5e7eb', textAlign: 'left', minWidth: '80px' }}>Quantity</th>
                <th style={{ padding: '12px 8px', border: '1px solid #e5e7eb', textAlign: 'left', minWidth: '100px' }}>Unit Price</th>
                <th style={{ padding: '12px 8px', border: '1px solid #e5e7eb', textAlign: 'left', minWidth: '80px' }}>CGST %</th>
                <th style={{ padding: '12px 8px', border: '1px solid #e5e7eb', textAlign: 'left', minWidth: '80px' }}>SGST %</th>
                <th style={{ padding: '12px 8px', border: '1px solid #e5e7eb', textAlign: 'left', minWidth: '80px' }}>Tax</th>
                <th style={{ padding: '12px 8px', border: '1px solid #e5e7eb', textAlign: 'left', minWidth: '100px' }}>Total</th>
                <th style={{ padding: '12px 8px', border: '1px solid #e5e7eb', textAlign: 'center', minWidth: '60px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {product.sno}
                  </td>
                  <td style={{ padding: '4px', border: '1px solid #e5e7eb' }}>
                    <input
                      type="text"
                      value={product.itemName}
                      onChange={(e) => handleProductChange(index, 'itemName', e.target.value)}
                      style={{ width: '100%', border: 'none', padding: '4px', fontSize: '14px' }}
                      disabled={loading}
                    />
                  </td>
                  <td style={{ padding: '4px', border: '1px solid #e5e7eb' }}>
                    <input
                      type="text"
                      value={product.category}
                      onChange={(e) => handleProductChange(index, 'category', e.target.value)}
                      style={{ width: '100%', border: 'none', padding: '4px', fontSize: '14px' }}
                      disabled={loading}
                    />
                  </td>
                  <td style={{ padding: '4px', border: '1px solid #e5e7eb' }}>
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                      style={{ width: '100%', border: 'none', padding: '4px', fontSize: '14px' }}
                      min="0"
                      step="1"
                      disabled={loading}
                    />
                  </td>
                  <td style={{ padding: '4px', border: '1px solid #e5e7eb' }}>
                    <input
                      type="number"
                      value={product.unitPrice}
                      onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)}
                      style={{ width: '100%', border: 'none', padding: '4px', fontSize: '14px' }}
                      min="0"
                      step="0.01"
                      disabled={loading}
                    />
                  </td>
                  <td style={{ padding: '4px', border: '1px solid #e5e7eb' }}>
                    <input
                      type="number"
                      value={product.cgst}
                      onChange={(e) => handleProductChange(index, 'cgst', e.target.value)}
                      style={{ width: '100%', border: 'none', padding: '4px', fontSize: '14px' }}
                      min="0"
                      max="50"
                      step="0.1"
                      disabled={loading}
                    />
                  </td>
                  <td style={{ padding: '4px', border: '1px solid #e5e7eb' }}>
                    <input
                      type="number"
                      value={product.sgst}
                      onChange={(e) => handleProductChange(index, 'sgst', e.target.value)}
                      style={{ width: '100%', border: 'none', padding: '4px', fontSize: '14px' }}
                      min="0"
                      max="50"
                      step="0.1"
                      disabled={loading}
                    />
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'right' }}>
                    ₹{product.tax || '0.00'}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 'bold' }}>
                    ₹{product.total || '0.00'}
                  </td>
                  <td style={{ padding: '4px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <button
                      onClick={() => removeProductRow(index)}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      disabled={products.length === 1 || loading}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Summary */}
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ 
          backgroundColor: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px', 
          padding: '16px', 
          minWidth: '300px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Grand Total:</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
              ₹{calculateGrandTotal()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleBack}
          className="btn btn-gray"
          disabled={loading}
        >
          Back
        </button>
        <button 
          onClick={resetForm}
          className="btn btn-yellow"
          disabled={loading}
        >
          Reset
        </button>
        <button 
          onClick={handleSaveInvoice}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>
    </div>
  );
}