import { useState } from 'react';
import { useVendor } from '../contexts/VendorContext';
import '../styles/VendorManagement.css';

const AddVendor = ({ onVendorAdded, onBack }) => {
  const { addVendor } = useVendor();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    gstNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await addVendor(formData);
      setFormData({ name: '', address: '', description: '', gstNumber: '' });
      setSuccess('Vendor added successfully!');
      if (onVendorAdded) onVendorAdded();
    } catch (err) {
      setError('Failed to add vendor. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="content-panel full-width">
      <div className="panel-header left-aligned">
        <h2 className="section-title">Add New Vendor</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
      
      <form onSubmit={handleSubmit} className="vendor-form full-width-form left-aligned">
        <div className="form-single-column">
          <div className="form-group">
            <label htmlFor="name">Vendor Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input extra-compact"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter vendor name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gstNumber">GST Number*</label>
            <input
              type="text"
              id="gstNumber"
              name="gstNumber"
              className="form-input extra-compact"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="Enter GST number"
              pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
              title="Please enter a valid GST number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address*</label>
            <textarea
              id="address"
              name="address"
              className="form-input extra-compact"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete address"
              rows="2"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-input extra-compact"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter vendor description"
              rows="2"
            />
          </div>
        </div>

        <div className="button-group extra-compact left-aligned">
          <button type="submit" className="btn btn-blue btn-extra-small">
            Add Vendor
          </button>
          <button 
            type="button" 
            className="btn btn-gray btn-extra-small"
            onClick={onBack}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVendor;