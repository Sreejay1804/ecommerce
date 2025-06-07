import { useEffect, useState } from 'react';

export default function AddCustomer({ onAddCustomer, onUpdateCustomer, onBack, customers }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Check if we're editing a customer from URL params or external trigger
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId && customers) {
      const customerToEdit = customers.find(c => c.id.toString() === editId);
      if (customerToEdit) {
        handleEditCustomer(customerToEdit);
      }
    }
  }, [customers]);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      name: '',
      email: '',
      phone: ''
    };

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
      isValid = false;
    }

    // Check for duplicate email (only when adding new customer)
    if (!isEditing && customers) {
      const emailExists = customers.some(customer =>
        customer.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (emailExists) {
        errors.email = 'A customer with this email already exists';
        isValid = false;
      }
      const phoneExists = customers.some(customer =>
        customer.phone === formData.phone
      );
      if (phoneExists) {
        errors.phone = 'A customer with this phone number already exists';
        isValid = false;
      }
    }

    // Check for duplicate email/phone when editing (exclude current customer)
    if (isEditing && customers && selectedCustomerId) {
      const emailExists = customers.some(customer =>
        customer.email.toLowerCase() === formData.email.toLowerCase() &&
        customer.id !== selectedCustomerId
      );
      if (emailExists) {
        errors.email = 'A customer with this email already exists';
        isValid = false;
      }
      const phoneExists = customers.some(customer =>
        customer.phone === formData.phone &&
        customer.id !== selectedCustomerId
      );
      if (phoneExists) {
        errors.phone = 'A customer with this phone number already exists';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      // Allow only digits and limit to 10 characters
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setFormData({
        ...formData,
        [name]: sanitized
      });
    } else if (name === 'name') {
      // Remove leading/trailing spaces and limit length
      const sanitized = value.slice(0, 100);
      setFormData({
        ...formData,
        [name]: sanitized
      });
    } else if (name === 'email') {
      // Convert to lowercase and trim
      const sanitized = value.toLowerCase().trim().slice(0, 100);
      setFormData({
        ...formData,
        [name]: sanitized
      });
    } else {
      setFormData({
        ...formData,
        [name]: value.slice(0, 255) // Limit address length
      });
    }

    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }

    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleEditCustomer = (customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || ''
    });
    setSelectedCustomerId(customer.id);
    setIsEditing(true);
    setFormErrors({ name: '', email: '', phone: '' });
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      let result;
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        address: formData.address.trim()
      };

      if (isEditing && selectedCustomerId !== null) {
        result = await onUpdateCustomer(selectedCustomerId, customerData);
        if (result.success) {
          alert('Customer updated successfully!');
          // Clear edit mode and form after successful update
          setIsEditing(false);
          setSelectedCustomerId(null);
          setFormData({ name: '', email: '', phone: '', address: '' });
          // Remove edit parameter from URL
          const url = new URL(window.location);
          url.searchParams.delete('edit');
          window.history.pushState(null, '', url);
          // Return to customer list
          onBack();
        }
      } else {
        result = await onAddCustomer(customerData);
        if (result.success) {
          alert('Customer added successfully!');
          setFormData({ name: '', email: '', phone: '', address: '' });
        }
      }

      if (!result.success) {
        setSubmitError(result.error || 'An error occurred while saving the customer');
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Clear edit mode and form
    setFormData({ name: '', email: '', phone: '', address: '' });
    setFormErrors({ name: '', email: '', phone: '' });
    setIsEditing(false);
    setSelectedCustomerId(null);
    setSubmitError('');
    // Remove edit parameter from URL
    const url = new URL(window.location);
    url.searchParams.delete('edit');
    window.history.pushState(null, '', url);
    // Return to previous screen
    onBack();
  };

  return (
    <div className="content-panel">
      <h2 className="section-title">{isEditing ? 'Edit Customer' : 'Add New Customer'}</h2>
      
      {submitError && (
        <div className="error-message" style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`form-input ${formErrors.name ? 'input-error' : ''}`}
            placeholder="Enter customer name"
            maxLength="100"
            required
            disabled={isSubmitting}
          />
          {formErrors.name && (
            <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
              {formErrors.name}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Email <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${formErrors.email ? 'input-error' : ''}`}
            placeholder="Enter email address"
            maxLength="100"
            required
            disabled={isSubmitting}
          />
          {formErrors.email && (
            <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
              {formErrors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Phone <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            maxLength="10"
            className={`form-input ${formErrors.phone ? 'input-error' : ''}`}
            placeholder="Enter 10-digit phone number"
            required
            disabled={isSubmitting}
          />
          {formErrors.phone && (
            <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
              {formErrors.phone}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter address (optional)"
            maxLength="255"
            rows="3"
            disabled={isSubmitting}
          />
        </div>

        <div className="button-group">
          <button 
            type="submit" 
            className="btn btn-blue"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Customer' : 'Add Customer')}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-gray"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}