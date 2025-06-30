import { useEffect, useState } from 'react';

export default function AddProduct({ onAddProduct, onUpdateProduct, editingProduct, onBack }) {
  const [form, setForm] = useState({
    name: '', 
    category: '', 
    unitPrice: '', 
    description: ''
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || '',
        category: editingProduct.category || '',
        unitPrice: editingProduct.unitPrice?.toString() || '',
        description: editingProduct.description || ''
      });
    } else {
      setForm({
        name: '', 
        category: '', 
        unitPrice: '', 
        description: ''
      });
    }
    setError(null);
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!form.category.trim()) {
      setError('Category is required');
      return false;
    }
    if (!form.unitPrice.trim()) {
      setError('Unit price is required');
      return false;
    }
    
    const price = parseFloat(form.unitPrice);
    if (isNaN(price) || price <= 0) {
      setError('Unit price must be a valid number greater than 0');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const productData = {
        name: form.name.trim(),
        category: form.category.trim(),
        unitPrice: parseFloat(form.unitPrice),
        description: form.description.trim()
      };

      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, productData);
      } else {
        await onAddProduct(productData);
      }
      
      // Success - go back to main screen
      onBack();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="content-panel">
      <form onSubmit={handleSubmit}>
        <h2 className="section-title">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter product name"
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}
            disabled={isSubmitting}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Category *
          </label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Enter product category"
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}
            disabled={isSubmitting}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Unit Price (₹) *
          </label>
          <input
            type="number"
            name="unitPrice"
            value={form.unitPrice}
            onChange={handleChange}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}
            disabled={isSubmitting}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter product description (optional)"
            rows="3"
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              resize: 'vertical'
            }}
            disabled={isSubmitting}
          />
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

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '24px',
          gap: '12px'
        }}>
          <button 
            type="button" 
            onClick={onBack}
            disabled={isSubmitting}
            style={{ 
              padding: '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#f5f5f5',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            Back
          </button>
          <button 
            type="submit" 
            className="btn btn-blue"
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting 
              ? (editingProduct ? 'Updating...' : 'Adding...') 
              : (editingProduct ? 'Update Product' : 'Add Product')
            }
          </button>
        </div>
      </form>
    </div>
  );
}