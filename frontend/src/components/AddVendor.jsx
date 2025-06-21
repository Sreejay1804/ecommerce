import { useEffect, useState } from 'react';

export default function AddVendor({ onAddVendor, onUpdateVendor, onBack, vendors }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Update the useEffect hook that handles edit mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId && vendors) {
      const vendorToEdit = vendors.find(v => v.id.toString() === editId);
      if (vendorToEdit) {
        setFormData({
          name: vendorToEdit.name,
          email: vendorToEdit.email,
          phone: vendorToEdit.phone,
          address: vendorToEdit.address || '',
          gstNumber: vendorToEdit.gstNumber || '',
          description: vendorToEdit.description || ''
        });
        setSelectedVendorId(vendorToEdit.id);
        setIsEditing(true);
        setFormErrors({ name: '', email: '', phone: '', address: '', gstNumber: '' });
      }
    }
  }, [vendors]);

  // Update the validateForm function
  const validateForm = () => {
    let isValid = true;
    const errors = {
      name: '',
      email: '',
      phone: '',
      address: '',
      gstNumber: ''
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

    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    }

    // GST Number validation (simple format: 15 chars, alphanumeric)
    if (!formData.gstNumber.trim()) {
      errors.gstNumber = 'GST Number is required';
      isValid = false;
    } else if (!/^[0-9A-Z]{15}$/i.test(formData.gstNumber.trim())) {
      errors.gstNumber = 'GST Number must be 15 alphanumeric characters';
      isValid = false;
    }

    // Check for duplicate email and phone only when adding new vendor
    if (!isEditing && vendors) {
      const emailExists = vendors.some(vendor =>
        vendor.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (emailExists) {
        errors.email = 'A vendor with this email already exists';
        isValid = false;
      }
      const phoneExists = vendors.some(vendor =>
        vendor.phone === formData.phone
      );
      if (phoneExists) {
        errors.phone = 'A vendor with this phone number already exists';
        isValid = false;
      }
    }

    // Check only for duplicate email when editing (exclude current vendor)
    if (isEditing && vendors && selectedVendorId) {
      const emailExists = vendors.some(vendor =>
        vendor.email.toLowerCase() === formData.email.toLowerCase() &&
        vendor.id !== selectedVendorId
      );
      if (emailExists) {
        errors.email = 'A vendor with this email already exists';
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
    } else if (name === 'gstNumber') {
      // Uppercase, remove spaces, limit to 15 chars
      const sanitized = value.toUpperCase().replace(/\s/g, '').slice(0, 15);
      setFormData({
        ...formData,
        [name]: sanitized
      });
    } else if (name === 'address') {
      setFormData({
        ...formData,
        [name]: value.slice(0, 255)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value.slice(0, 255)
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

  const handleEditVendor = (vendor) => {
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address || '',
      gstNumber: vendor.gstNumber || '',
      description: vendor.description || ''
    });
    setSelectedVendorId(vendor.id);
    setIsEditing(true);
    setFormErrors({ name: '', email: '', phone: '', address: '', gstNumber: '' });
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      let result;
      const vendorData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        address: formData.address.trim(),
        gstNumber: formData.gstNumber.trim(),
        description: formData.description.trim()
      };

      if (isEditing && selectedVendorId !== null) {
        result = await onUpdateVendor(selectedVendorId, vendorData);
        if (result.success) {
          alert('Vendor updated successfully!');
          // Clear edit mode and form after successful update
          setIsEditing(false);
          setSelectedVendorId(null);
          setFormData({ name: '', email: '', phone: '', address: '', gstNumber: '', description: '' });
          // Remove edit parameter from URL
          const url = new URL(window.location);
          url.searchParams.delete('edit');
          window.history.pushState(null, '', url);
          // Return to vendor list
          onBack();
        }
      } else {
        result = await onAddVendor(vendorData);
        if (result.success) {
          alert('Vendor added successfully!');
          setFormData({ name: '', email: '', phone: '', address: '', gstNumber: '', description: '' });
        }
      }

      if (!result.success) {
        setSubmitError(result.error || 'An error occurred while saving the vendor');
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
    setFormData({ name: '', email: '', phone: '', address: '', gstNumber: '', description: '' });
    setFormErrors({ name: '', email: '', phone: '', address: '', gstNumber: '' });
    setIsEditing(false);
    setSelectedVendorId(null);
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
      <h2 className="section-title">{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</h2>
      
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
            placeholder="Enter vendor name"
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
          <label className="form-label">
            Address <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`form-input ${formErrors.address ? 'input-error' : ''}`}
            placeholder="Enter address"
            maxLength="255"
            rows="3"
            required
            disabled={isSubmitting}
          />
          {formErrors.address && (
            <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
              {formErrors.address}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            GST Number <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleInputChange}
            className={`form-input ${formErrors.gstNumber ? 'input-error' : ''}`}
            placeholder="Enter GST Number"
            maxLength="15"
            required
            disabled={isSubmitting}
          />
          {formErrors.gstNumber && (
            <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
              {formErrors.gstNumber}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter vendor description (optional)"
            maxLength="255"
            rows="2"
            disabled={isSubmitting}
          />
        </div>

        <div className="button-group">
          <button 
            type="submit" 
            className="btn btn-blue"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Vendor' : 'Add Vendor')}
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