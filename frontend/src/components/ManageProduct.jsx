import { useEffect, useState } from 'react';

export default function ManageProduct({ onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingProduct)
      });

      if (!response.ok) throw new Error('Failed to update product');

      await fetchProducts();
      setEditingProduct(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete product');

      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="content-panel">
      <h2 className="section-title">Manage Products</h2>

      {editingProduct ? (
        <div className="edit-form">
          <h3>Edit Product</h3>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={editingProduct.category}
              onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Unit Price</label>
            <input
              type="number"
              value={editingProduct.unitPrice}
              onChange={(e) => setEditingProduct({ ...editingProduct, unitPrice: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="button-group">
            <button onClick={() => setEditingProduct(null)} className="btn btn-gray">
              Cancel
            </button>
            <button onClick={handleUpdate} className="btn btn-blue">
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{parseFloat(product.unitPrice).toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleEdit(product)} className="btn-link btn-blue-link">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="btn-link btn-red-link">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="button-group" style={{ marginTop: '1rem' }}>
        <button onClick={onBack} className="btn btn-gray">
          Back
        </button>
      </div>
    </div>
  );
}