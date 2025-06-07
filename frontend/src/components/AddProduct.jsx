import { useState } from 'react';

export default function AddProduct({ onAddProduct, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unitPrice: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category.trim(),
          unitPrice: parseFloat(formData.unitPrice),
          description: formData.description.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      const newProduct = await response.json();
      setSuccess('Product added successfully!');
      setFormData({
        name: '',
        category: '',
        unitPrice: '',
        description: ''
      });
      
      if (onAddProduct) {
        onAddProduct(newProduct);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-panel">
      <h2 className="section-title">Add New Product</h2>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="form-input"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="form-input"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Unit Price (₹) *</label>
          <input
            type="number"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            required
            min="0"
            step="0.01"
            className="form-input"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="form-input"
            rows="3"
            disabled={loading}
          />
        </div>

        <div className="button-group">
          <button type="button" onClick={onBack} className="btn btn-gray" disabled={loading}>
            Back
          </button>
          <button type="submit" className="btn btn-blue" disabled={loading}>
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}