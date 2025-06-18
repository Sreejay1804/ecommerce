import { useState } from 'react';
import { useVendor } from '../contexts/VendorContext';
import '../styles/VendorManagement.css';

const AddVendor = ({ onVendorAdded }) => {
  const { addVendor } = useVendor();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await addVendor(formData);
      setFormData({ name: '', email: '', phone: '', address: '' });
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
    <div className="content-panel">
      <h2 className="section-title">Add New Vendor</h2>
      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="vendor-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter vendor name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter vendor email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="form-input"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter vendor phone"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            className="form-input"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter vendor address"
            rows="3"
            required
          />
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-blue">
            Add Vendor
          </button>
          <button 
            type="button" 
            className="btn btn-gray"
            onClick={() => setFormData({ name: '', email: '', phone: '', address: '' })}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVendor;