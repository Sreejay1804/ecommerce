// components/CreateInvoice.jsx
import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function CreateInvoice({ handleBack, customers, products = [], onSave }) { // Add products and onSave prop
  // Helper function to get current local datetime for datetime-local input
  const getCurrentLocalDateTime = () => {
    // Create a date object for current time
    const now = new Date();
    
    // Convert to IST (UTC+5:30)
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    return istTime.toISOString().slice(0, 16);
  };

  // Invoice data state
  const [invoiceData, setInvoiceData] = useState({
    customerName: '',
    address: '',
    mobile: '',
    invoiceNo: '',
    dateTime: getCurrentLocalDateTime() // This will now be in IST
  });

  // Products state - using itemName to match backend
  const [invoiceProducts, setInvoiceProducts] = useState([
    { 
      sno: 1, 
      itemName: '', 
      category: '', 
      quantity: '', 
      unitPrice: '', 
      cgst: '18', 
      sgst: '18', 
      tax: '', 
      total: '' 
    }
  ]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Client-side invoice number generation fallback
  const generateClientInvoiceNumber = useCallback(() => {
    // Generate a random 6-digit number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    // Add current year and month for some context
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `INV-${year}${month}-${randomNum}`;
  }, []);

  // Generate invoice number (API or client-side)
  const generateInvoiceNumber = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/generate-number`);
      if (response.ok) {
        const invoiceNumber = await response.text();
        setInvoiceData(prev => ({ ...prev, invoiceNo: invoiceNumber }));
      } else {
        // Fallback to client-side generation
        const clientInvoiceNo = generateClientInvoiceNumber();
        setInvoiceData(prev => ({ ...prev, invoiceNo: clientInvoiceNo }));
      }
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to client-side generation
      const clientInvoiceNo = generateClientInvoiceNumber();
      setInvoiceData(prev => ({ ...prev, invoiceNo: clientInvoiceNo }));
    }
  }, [generateClientInvoiceNumber]); // Add generateClientInvoiceNumber to dependency array

  // Generate invoice number on component mount
  useEffect(() => {
    generateInvoiceNumber();
  }, [generateInvoiceNumber]);

  // Check if invoice number already exists
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

  // Handle invoice input changes
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

  // Handle product field changes with auto-calculation
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...invoiceProducts];
    
    if (typeof field === 'object') {
      // Handle product selection from dropdown
      updatedProducts[index] = {
        ...updatedProducts[index],
        itemName: field.itemName,
        category: field.category,
        unitPrice: field.unitPrice,
        quantity: updatedProducts[index].quantity || '1',
        cgst: '18',
        sgst: '18'
      };
    } else {
      // Handle individual field changes
      updatedProducts[index][field] = value;
    }

    // Calculate totals
    const product = updatedProducts[index];
    const qty = parseFloat(product.quantity) || 0;
    const price = parseFloat(product.unitPrice) || 0;
    const cgst = 18;
    const sgst = 18;

    const subtotal = qty * price;
    const cgstAmount = (subtotal * cgst) / 100;
    const sgstAmount = (subtotal * sgst) / 100;
    const tax = cgstAmount + sgstAmount;
    const total = subtotal + tax;

    updatedProducts[index].tax = tax.toFixed(2);
    updatedProducts[index].total = total.toFixed(2);

    setInvoiceProducts(updatedProducts);
  };

  // Add new product row
  const addProductRow = () => {
    setInvoiceProducts([...invoiceProducts, {
      sno: invoiceProducts.length + 1,
      itemName: '',
      category: '',
      quantity: '',
      unitPrice: '',
      cgst: '18',
      sgst: '18',
      tax: '',
      total: ''
    }]);
  };

  // Remove product row
  const removeProductRow = (index) => {
    if (invoiceProducts.length > 1) {
      const updatedProducts = invoiceProducts.filter((_, i) => i !== index);
      // Update serial numbers
      updatedProducts.forEach((product, i) => {
        product.sno = i + 1;
      });
      setInvoiceProducts(updatedProducts);
    }
  };

  // Handle customer selection from dropdown
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

  // Calculate grand total
  const calculateGrandTotal = () => {
    return invoiceProducts.reduce((sum, product) => sum + (parseFloat(product.total) || 0), 0).toFixed(2);
  };

  // Calculate subtotal (before tax)
  const calculateSubtotal = () => {
    return invoiceProducts.reduce((sum, product) => {
      const qty = parseFloat(product.quantity) || 0;
      const price = parseFloat(product.unitPrice) || 0;
      return sum + (qty * price);
    }, 0).toFixed(2);
  };

  // Calculate total tax
  const calculateTotalTax = () => {
    return invoiceProducts.reduce((sum, product) => sum + (parseFloat(product.tax) || 0), 0).toFixed(2);
  };

  // Generate PDF Invoice
  const generatePDFInvoice = async () => {
    setIsGeneratingPDF(true);
    try {
      // Create a new window for PDF content
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        throw new Error('Unable to open print window. Please allow popups.');
      }

      // Get valid products for PDF
      const validProducts = invoiceProducts.filter(p => 
        p.itemName.trim() && 
        p.quantity && 
        parseFloat(p.quantity) > 0 && 
        p.unitPrice && 
        parseFloat(p.unitPrice) > 0
      );

      if (validProducts.length === 0) {
        setError('Please add at least one valid product to generate PDF');
        printWindow.close();
        return;
      }

      // Format date
      const invoiceDate = new Date(invoiceData.dateTime);
      const formattedDate = invoiceDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = invoiceDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Generate PDF HTML content
      const pdfContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoiceData.invoiceNo}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              background: white;
            }
            
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #4f46e5;
            }
            
            .company-info h1 {
              color: #4f46e5;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .company-info p {
              color: #666;
              font-size: 14px;
            }
            
            .invoice-details {
              text-align: right;
            }
            
            .invoice-details h2 {
              color: #4f46e5;
              font-size: 24px;
              margin-bottom: 10px;
            }
            
            .invoice-details p {
              margin-bottom: 5px;
              font-size: 14px;
            }
            
            .billing-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            
            .billing-info {
              flex: 1;
              margin-right: 20px;
            }
            
            .billing-info h3 {
              color: #4f46e5;
              font-size: 16px;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .billing-info p {
              margin-bottom: 5px;
              color: #555;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              font-size: 11px;
            }
            
            .items-table th {
              background-color: #4f46e5;
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #4f46e5;
            }
            
            .items-table td {
              padding: 10px 8px;
              border: 1px solid #e5e7eb;
            }
            
            .items-table tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            .items-table tbody tr:hover {
              background-color: #f3f4f6;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
            
            .totals-section {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 30px;
            }
            
            .totals-table {
              width: 300px;
              border-collapse: collapse;
            }
            
            .totals-table td {
              padding: 8px 12px;
              border: 1px solid #e5e7eb;
            }
            
            .totals-table .label {
              background-color: #f9fafb;
              font-weight: bold;
              text-align: right;
              width: 60%;
            }
            
            .totals-table .amount {
              text-align: right;
              width: 40%;
            }
            
            .grand-total {
              background-color: #4f46e5 !important;
              color: white !important;
              font-weight: bold;
              font-size: 14px;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #666;
              font-size: 11px;
            }
            
            .payment-terms {
              margin-top: 20px;
              padding: 15px;
              background-color: #f8fafc;
              border-radius: 5px;
              border-left: 4px solid #4f46e5;
            }
            
            .payment-terms h4 {
              color: #4f46e5;
              margin-bottom: 5px;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              
              .invoice-container {
                padding: 10px;
                margin: 0;
                max-width: none;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="invoice-header">
              <div class="company-info">
                <h1>Your Company Name</h1>
                <p>Your Company Address</p>
                <p>City, State, PIN Code</p>
                <p>Phone: +91 XXXXX XXXXX</p>
                <p>Email: info@yourcompany.com</p>
                <p>GST No: XXXXXXXXXXXXXXX</p>
              </div>
              <div class="invoice-details">
                <h2>INVOICE</h2>
                <p><strong>Invoice No:</strong> ${invoiceData.invoiceNo}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
              </div>
            </div>
            
            <!-- Billing Information -->
            <div class="billing-section">
              <div class="billing-info">
                <h3>Bill To:</h3>
                <p><strong>${invoiceData.customerName}</strong></p>
                ${invoiceData.address ? `<p>${invoiceData.address}</p>` : ''}
                ${invoiceData.mobile ? `<p>Mobile: ${invoiceData.mobile}</p>` : ''}
              </div>
              <div class="billing-info">
                <h3>Payment Status:</h3>
                <p><strong style="color: #f59e0b;">PENDING</strong></p>
              </div>
            </div>
            
            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th class="text-center" style="width: 8%;">S.No</th>
                  <th style="width: 25%;">Item Description</th>
                  <th style="width: 15%;">Category</th>
                  <th class="text-center" style="width: 10%;">Qty</th>
                  <th class="text-right" style="width: 12%;">Unit Price</th>
                  <th class="text-center" style="width: 8%;">CGST%</th>
                  <th class="text-center" style="width: 8%;">SGST%</th>
                  <th class="text-right" style="width: 12%;">Tax Amount</th>
                  <th class="text-right" style="width: 12%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${validProducts.map((product, index) => `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${product.itemName}</td>
                    <td>${product.category || '-'}</td>
                    <td class="text-center">${product.quantity}</td>
                    <td class="text-right">₹${parseFloat(product.unitPrice).toFixed(2)}</td>
                    <td class="text-center">18%</td>
                    <td class="text-center">18%</td>
                    <td class="text-right">₹${product.tax || '0.00'}</td>
                    <td class="text-right"><strong>₹${product.total || '0.00'}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <!-- Totals Section -->
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td class="label">Subtotal:</td>
                  <td class="amount">₹${calculateSubtotal()}</td>
                </tr>
                <tr>
                  <td class="label">Total Tax:</td>
                  <td class="amount">₹${calculateTotalTax()}</td>
                </tr>
                <tr class="grand-total">
                  <td class="label grand-total">Grand Total:</td>
                  <td class="amount grand-total">₹${calculateGrandTotal()}</td>
                </tr>
              </table>
            </div>
            
            <!-- Payment Terms -->
            <div class="payment-terms">
              <h4>Payment Terms & Notes:</h4>
              <p>• Payment is due within 30 days of invoice date.</p>
              <p>• Please include invoice number with your payment.</p>
              <p>• Thank you for your business!</p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p>This is a computer-generated invoice and does not require a signature.</p>
              <p>Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
            </div>
          </div>
          
          <script>
            // Auto-print when page loads
            window.onload = function() {
              window.print();
            };
            
            // Close window after printing
            window.onafterprint = function() {
              window.close();
            };
          </script>
        </body>
        </html>
      `;

      // Write content to print window
      printWindow.document.write(pdfContent);
      printWindow.document.close();

      // Focus on the print window
      printWindow.focus();

    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF: ' + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Form validation
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
    const validProducts = invoiceProducts.filter(p => 
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

  // Prepare invoice items for backend
  const prepareInvoiceItems = () => {
    return invoiceProducts
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
        cgstAmount: ((parseFloat(product.unitPrice) * parseInt(product.quantity)) * (parseFloat(product.cgst) || 0)) / 100,
        sgstAmount: ((parseFloat(product.unitPrice) * parseInt(product.quantity)) * (parseFloat(product.sgst) || 0)) / 100,
        taxAmount: parseFloat(product.tax) || 0,
        totalPrice: parseFloat(product.total) || 0
      }));
  };

  // Save invoice to backend
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
      const invoicePayload = {
        customerName: invoiceData.customerName.trim(),
        customerAddress: invoiceData.address.trim(),
        customerMobile: invoiceData.mobile.trim(),
        invoiceNo: invoiceData.invoiceNo.trim(),
        // Convert the datetime-local input to ISO string for backend
        invoiceDate: new Date(invoiceData.dateTime).toISOString(),
        totalAmount: parseFloat(calculateGrandTotal()),
        paymentStatus: 'PENDING',
        items: prepareInvoiceItems()
      };

      console.log('Sending invoice payload:', invoicePayload);

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
        console.error('Backend error response:', errorData);
        setError(errorData.message || errorData.error || 'Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save and Print Invoice
  const handleSaveAndPrint = async () => {
    setError('');
    setSuccess('');
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);

    try {
      const invoicePayload = {
        customerName: invoiceData.customerName.trim(),
        customerAddress: invoiceData.address.trim(),
        customerMobile: invoiceData.mobile.trim(),
        invoiceNo: invoiceData.invoiceNo.trim(),
        invoiceDate: new Date(invoiceData.dateTime).toISOString(),
        totalAmount: parseFloat(calculateGrandTotal()),
        paymentStatus: 'PENDING',
        items: prepareInvoiceItems()
      };

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
        
        // Generate PDF after successful save
        await generatePDFInvoice();
        
        // Reset form after successful save and print
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        setError(errorData.message || errorData.error || 'Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setInvoiceData({
      customerName: '',
      address: '',
      mobile: '',
      invoiceNo: '',
      dateTime: getCurrentLocalDateTime() // Use local time when resetting
    });
    setInvoiceProducts([
      { sno: 1, itemName: '', category: '', quantity: '', unitPrice: '', cgst: '18', sgst: '18', tax: '', total: '' }
    ]);
    generateInvoiceNumber();
    setError('');
    setSuccess('');
  };

  // Add a useEffect to update time automatically
  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setInvoiceData(prev => ({
        ...prev,
        dateTime: getCurrentLocalDateTime()
      }));
    }, 60000); // Update every minute

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

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
              {customers && customers.map(customer => (
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
              {invoiceProducts.map((product, index) => (
                <tr key={index}>
                  <td style={{ 
                    padding: '8px', 
                    border: '1px solid #e5e7eb', 
                    textAlign: 'center',
                    backgroundColor: '#f8fafc'  // Light background for s.no column
                  }}>
                    {index + 1}  {/* Automatically calculate s.no based on index */}
                  </td>
                  <td style={{ padding: '4px', border: '1px solid #e5e7eb' }}>
                    <select
                      value={product.itemName}
                      onChange={(e) => {
                        const selectedProduct = products.find(p => p.name === e.target.value);
                        if (selectedProduct) {
                          handleProductChange(index, {
                            itemName: selectedProduct.name,
                            category: selectedProduct.category, // This will be set from the selected product
                            unitPrice: selectedProduct.unitPrice.toString()
                          });
                        }
                      }}
                      style={{ 
                        width: '100%', 
                        border: 'none', 
                        padding: '4px', 
                        fontSize: '14px',
                        backgroundColor: 'white' 
                      }}
                      disabled={loading}
                    >
                      <option value="">Select a product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '4px', border: '1px solid #e5e7eb' }}>
                    <input
                      type="text"
                      value={product.category}
                      readOnly
                      style={{ 
                        width: '100%', 
                        border: 'none', 
                        padding: '4px', 
                        fontSize: '14px',
                        backgroundColor: '#f3f4f6'
                      }}
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
                      readOnly
                      style={{ 
                        width: '100%', 
                        border: 'none', 
                        padding: '4px', 
                        fontSize: '14px',
                        backgroundColor: '#f3f4f6'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px', border: '1px solid #e5e7eb' }}>
                    <input
                      type="text"
                      value="18%"
                      style={{ width: '100%', border: 'none', padding: '4px', fontSize: '14px', backgroundColor: '#f3f4f6', textAlign: 'center' }}
                      disabled={true}
                      readOnly
                    />
                  </td>
                  <td style={{ padding: '4px', border: '1px solid #e5e7eb' }}>
                    <input
                      type="text"
                      value="18%"
                      style={{ width: '100%', border: 'none', padding: '4px', fontSize: '14px', backgroundColor: '#f3f4f6', textAlign: 'center' }}
                      disabled={true}
                      readOnly
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
                      disabled={invoiceProducts.length === 1 || loading}
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
            <span style={{ fontSize: '14px' }}>Subtotal:</span>
            <span style={{ fontSize: '14px' }}>₹{calculateSubtotal()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px' }}>Total Tax:</span>
            <span style={{ fontSize: '14px' }}>₹{calculateTotalTax()}</span>
          </div>
          <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          disabled={loading || isGeneratingPDF}
        >
          Back
        </button>
        <button 
          onClick={resetForm}
          className="btn btn-red"
          disabled={loading || isGeneratingPDF}
        >
          Reset
        </button>
        <button 
          onClick={generatePDFInvoice}
          className="btn btn-green"
          disabled={loading || isGeneratingPDF}
          style={{ 
            backgroundColor: isGeneratingPDF ? '#9ca3af' : '#16a34a',
            cursor: isGeneratingPDF ? 'wait' : 'pointer'
          }}
        >
          {isGeneratingPDF ? 'Generating PDF...' : 'Print Preview'}
        </button>
        <button 
          onClick={handleSaveInvoice}
          className="btn btn-blue"
          disabled={loading || isGeneratingPDF}
        >
          {loading ? 'Saving...' : 'Save Invoice'}
        </button>
        <button 
          onClick={handleSaveAndPrint}
          className="btn btn-purple"
          disabled={loading || isGeneratingPDF}
          style={{ 
            backgroundColor: loading ? '#9ca3af' : '#7c3aed',
            cursor: loading ? 'wait' : 'pointer'
          }}
        >
          {loading ? 'Saving & Printing...' : 'Save & Print'}
        </button>
      </div>  
    </div>
  );
}