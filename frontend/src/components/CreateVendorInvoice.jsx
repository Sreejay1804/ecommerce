import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { useVendor } from '../contexts/VendorContext';
import productService from '../services/productService'; // Updated import

export default function CreateVendorInvoice({ onBack }) {
  const navigate = useNavigate(); // Add this line
  const { vendors } = useVendor();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: '',
    dateTime: '',
    vendorName: '',
    address: '',
    mobile: '',
    vendorGstNumber: '', // Initialize GST number in state
    items: [
      {
        id: Date.now(),
        productId: '',
        productName: '',
        category: '',
        quantity: 1,
        unitPrice: 0,
        cgstPercent: 9,
        sgstPercent: 9,
        total: 0
      }
    ]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(''); // Notification state

  useEffect(() => {
    // Generate invoice number and set current date/time
    const generateInvoiceNo = () => {
      const now = new Date();
      const invoiceNo = `INV${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      return invoiceNo;
    };

    const now = new Date();
    const formattedDateTime = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setInvoiceData(prev => ({
      ...prev,
      invoiceNo: generateInvoiceNo(),
      dateTime: formattedDateTime
    }));

    // Fetch products
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Using the correct method name from your productService
      const data = await productService.getItems();
      setProducts(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    vendor.phone.includes(vendorSearchTerm)
  );

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setInvoiceData(prev => ({
      ...prev,
      vendorName: vendor.name,
      address: vendor.address || '',
      mobile: vendor.phone,
      vendorGstNumber: vendor.gstNumber || '' // Add GST number to invoiceData
    }));
    setVendorSearchTerm(vendor.name);
    setShowVendorDropdown(false);
  };

  const addInvoiceItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          productId: '',
          productName: '',
          category: '',
          quantity: 1,
          unitPrice: 0,
          cgstPercent: 9,
          sgstPercent: 9,
          total: 0
        }
      ]
    }));
  };

  const updateInvoiceItem = (index, field, value) => {
    setInvoiceData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      // If product is selected, update related fields
      if (field === 'productId' && value) {
        const product = products.find(p => p.id === parseInt(value));
        if (product) {
          newItems[index] = {
            ...newItems[index],
            productName: product.name,
            category: product.category,
            // Handle BigDecimal conversion properly
            unitPrice: typeof product.unitPrice === 'number' ? product.unitPrice : parseFloat(product.unitPrice) || 0
          };
        }
      }

      // Calculate total for the item
      const item = newItems[index];
      const subtotal = item.quantity * item.unitPrice;
      const cgstAmount = (subtotal * item.cgstPercent) / 100;
      const sgstAmount = (subtotal * item.sgstPercent) / 100;
      newItems[index].total = subtotal + cgstAmount + sgstAmount;

      return { ...prev, items: newItems };
    });
  };

  const removeInvoiceItem = (index) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalTax = invoiceData.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const cgst = (itemSubtotal * item.cgstPercent) / 100;
      const sgst = (itemSubtotal * item.sgstPercent) / 100;
      return sum + cgst + sgst;
    }, 0);
    const grandTotal = subtotal + totalTax;

    return { subtotal, totalTax, grandTotal };
  };

  const handleSubmit = async () => {
    if (!selectedVendor) {
      setError('Please select a vendor');
      return;
    }

    if (invoiceData.items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    // Validate that all items have products selected
    const invalidItems = invoiceData.items.filter(item => !item.productId);
    if (invalidItems.length > 0) {
      setError('Please select products for all items');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { subtotal, totalTax, grandTotal } = calculateTotals();
      
      const invoicePayload = {
        invoiceNo: invoiceData.invoiceNo,
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.name,
        vendorAddress: selectedVendor.address,
        vendorPhone: selectedVendor.phone,
        vendorGstNumber: invoiceData.vendorGstNumber, // Save GST number
        dateTime: invoiceData.dateTime,
        items: invoiceData.items.map(item => ({
          productId: parseInt(item.productId),
          productName: item.productName,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          cgstPercent: item.cgstPercent,
          sgstPercent: item.sgstPercent,
          total: item.total
        })),
        subtotal,
        totalTax,
        grandTotal
      };

      // Updated API call to match your backend URL structure
      const response = await fetch('http://localhost:8080/api/vendor-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoicePayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create invoice');
      }

      setNotification('Invoice created successfully!');
      setTimeout(() => {
        setNotification('');
        if (typeof onBack === 'function') {
          onBack();
        } else {
          navigate('/vendor-invoice');
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to create invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print helper for Save & Print (robust print preview)
  const printInvoice = (invoiceData) => {
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
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();
    // Wait for content to load before printing
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        document.body.removeChild(iframe);
      }, 200);
    };
    // Fallback: if onload doesn't fire, use a timeout
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        document.body.removeChild(iframe);
      }
    }, 600);
  };
  // Save & Print handler
  const handleSaveAndPrint = async () => {
    if (!selectedVendor) {
      setError('Please select a vendor');
      return;
    }
    if (invoiceData.items.length === 0) {
      setError('Please add at least one item');
      return;
    }
    const invalidItems = invoiceData.items.filter(item => !item.productId);
    if (invalidItems.length > 0) {
      setError('Please select products for all items');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const { subtotal, totalTax, grandTotal } = calculateTotals();
      const invoicePayload = {
        invoiceNo: invoiceData.invoiceNo,
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.name,
        vendorAddress: selectedVendor.address,
        vendorPhone: selectedVendor.phone,
        vendorGstNumber: invoiceData.vendorGstNumber,
        dateTime: invoiceData.dateTime,
        items: invoiceData.items.map(item => ({
          productId: parseInt(item.productId),
          productName: item.productName,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          cgstPercent: item.cgstPercent,
          sgstPercent: item.sgstPercent,
          total: item.total
        })),
        subtotal,
        totalTax,
        grandTotal
      };
      const response = await fetch('http://localhost:8080/api/vendor-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create invoice');
      }
      // Fetch the saved invoice (assume backend returns the invoice or fetch by invoiceNo)
      let savedInvoice = await response.json();
      if (!savedInvoice.items) {
        // fallback: fetch by invoiceNo
        const fetchResp = await fetch(`http://localhost:8080/api/vendor-invoices/invoiceNo/${invoicePayload.invoiceNo}`);
        if (fetchResp.ok) savedInvoice = await fetchResp.json();
        else savedInvoice = { ...invoicePayload };
      }
      printInvoice(savedInvoice);
      setNotification('Invoice created and ready to print!');
      setTimeout(() => setNotification(''), 3500);
      if (typeof onBack === 'function') {
        onBack();
      } else {
        navigate('/vendor-invoice');
      }
    } catch (err) {
      setError(err.message || 'Failed to create invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { subtotal, totalTax, grandTotal } = calculateTotals();

  return (
    <div className="content-panel">
      {notification && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: '#10b981',
          color: 'white',
          padding: '16px 28px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 2000,
          fontSize: '16px',
          fontWeight: 500
        }}>
          {notification}
        </div>
      )}

      <h2 className="section-title">Create Invoice</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Vendor Selection */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Select Vendor
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={vendorSearchTerm}
              onChange={(e) => {
                setVendorSearchTerm(e.target.value);
                setShowVendorDropdown(true);
              }}
              onFocus={() => setShowVendorDropdown(true)}
              placeholder="Select a vendor or enter manually"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            {showVendorDropdown && filteredVendors.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000
              }}>
                {filteredVendors.map(vendor => (
                  <div
                    key={vendor.id}
                    onClick={() => handleVendorSelect(vendor)}
                    style={{
                      padding: '8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {vendor.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Invoice Number */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Invoice No *
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              value={invoiceData.invoiceNo}
              readOnly
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}
            />
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const newInvoiceNo = `INV${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
                setInvoiceData(prev => ({ ...prev, invoiceNo: newInvoiceNo }));
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Vendor Name */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Vendor Name *
          </label>
          <input
            type="text"
            value={invoiceData.vendorName}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, vendorName: e.target.value, vendorGstNumber: '' }))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          {/* GST Number Input */}
          <label style={{ display: 'block', margin: '8px 0 4px 0', fontWeight: 'bold' }}>
            GST Number
          </label>
          <input
            type="text"
            value={invoiceData.vendorGstNumber}
            onChange={e => setInvoiceData(prev => ({ ...prev, vendorGstNumber: e.target.value }))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            placeholder="Enter GST Number"
          />
        </div>

        {/* Date & Time */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Date & Time *
          </label>
          <input
            type="text"
            value={invoiceData.dateTime}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, dateTime: e.target.value }))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Address */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Address
          </label>
          <textarea
            value={invoiceData.address}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, address: e.target.value }))}
            rows="3"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Mobile */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Mobile
          </label>
          <input
            type="text"
            value={invoiceData.mobile}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, mobile: e.target.value }))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      {/* Products Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '16px' }}>Products</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {loading && <span style={{ fontSize: '14px', color: '#666' }}>Loading products...</span>}
            <button
              type="button"
              onClick={addInvoiceItem}
              className="btn btn-green"
              style={{ padding: '8px 16px' }}
              disabled={loading}
            >
              Add Row
            </button>
            <button
              type="button"
              onClick={fetchProducts}
              className="btn"
              style={{ 
                padding: '8px 16px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
              disabled={loading}
            >
              Refresh Products
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="customer-table">
            <thead>
              <tr style={{ backgroundColor: '#6366f1', color: 'white' }}>
                <th>Sno</th>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>CGST %</th>
                <th>SGST %</th>
                <th>Tax</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <select
                      value={item.productId}
                      onChange={(e) => updateInvoiceItem(index, 'productId', e.target.value)}
                      style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{item.category}</td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                      style={{ width: '80px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </td>
                  <td>₹{item.unitPrice.toFixed(2)}</td>
                  <td>{item.cgstPercent}%</td>
                  <td>{item.sgstPercent}%</td>
                  <td>₹{((item.quantity * item.unitPrice * (item.cgstPercent + item.sgstPercent)) / 100).toFixed(2)}</td>
                  <td>₹{item.total.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => removeInvoiceItem(index)}
                      className="btn btn-red"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
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

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <div style={{ minWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span>Total Tax:</span>
            <span>₹{totalTax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 'bold', fontSize: '18px', color: '#10b981' }}>
            <span>Grand Total:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

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

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <button
          onClick={() => {
            if (typeof onBack === 'function') {
              onBack();
            } else {
              navigate('/vendor-invoice');
            }
          }}
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setInvoiceData(prev => ({ ...prev, items: [] }))}
            className="btn btn-red"
            style={{ padding: '10px 20px' }}
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-blue"
            style={{
              padding: '10px 20px',
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Invoice'}
          </button>
          <button
            onClick={handleSaveAndPrint}
            disabled={isSubmitting}
            className="btn"
            style={{
              padding: '10px 20px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Save & Print
          </button>
        </div>
      </div>
    </div>
  );
}