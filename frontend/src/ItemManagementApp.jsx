import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddProduct from './components/AddProduct1';
import ManageProducts from './components/ManageProducts';
import SearchProducts from './components/SearchProducts';
import './CustomerManagementApp.css';
import productService from './services/productService';

export default function ItemManagementApp() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getItems();
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to connect to the server. Please check if the backend is running on http://localhost:8080');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchProducts(); 
  }, []);

  const addProduct = async (productData) => {
    try {
      const newProduct = await productService.addItem(productData);
      setProducts(prevProducts => [...prevProducts, newProduct]);
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const updatedProduct = await productService.updateItem(id, productData);
      setProducts(prevProducts => 
        prevProducts.map(product => product.id === id ? updatedProduct : product)
      );
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      await productService.deleteItem(id);
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  const searchProducts = async (term) => {
    if (!term.trim()) {
      return products;
    }
    try {
      return await productService.searchItems(term);
    } catch (err) {
      console.error('Error searching products:', err);
      // Fallback to local search if backend search fails
      return products.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.category.toLowerCase().includes(term.toLowerCase())
      );
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="app-container">
        <div className="sidebar">
          <div className="sidebar-header"><h1>Dashboard</h1></div>
        </div>
        <div className="main-container">
          <main className="main-content">
            <div className="content-panel">
              <h2 className="section-title">Loading products...</h2>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header"><h1>Dashboard</h1></div>
        <div className="sidebar-content">
          <button 
            onClick={() => setActiveMenu(null)} 
            className={`sidebar-button ${activeMenu === null ? 'active' : ''}`}
          >
            Products
          </button>
          <button 
            onClick={() => {
              navigate('/vendor-management');
            }} 
            className="sidebar-button"
          >
            Vendor
          </button>
        </div>
      </div>
      <div className="main-container">
        <main className="main-content">
          {error && (
            <div style={{ 
              background: '#fee', 
              color: '#c00', 
              padding: '16px', 
              marginBottom: '16px', 
              borderRadius: '4px',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}
          
          {activeMenu === null && (
            <div className="content-panel">
              <h2 className="section-title">Product Management</h2>
              <div className="customer-actions-row" style={{ marginTop: '20px' }}>
                <button 
                  className="btn btn-blue" 
                  onClick={() => { 
                    setActiveMenu('add'); 
                    setEditProduct(null); 
                  }}
                >
                  Add New Product
                </button>
                <button 
                  className="btn btn-green" 
                  onClick={() => setActiveMenu('manage')}
                >
                  Manage Products
                </button>
                <button 
                  className="btn btn-purple" 
                  onClick={() => setActiveMenu('search')}
                >
                  Search Products
                </button>
              </div>
              
              {products.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h3>Recent Products ({products.length} total)</h3>
                  <table className="customer-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Unit Price</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map(product => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>₹{Number(product.unitPrice).toFixed(2)}</td>
                          <td>{product.description || 'No description'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeMenu === 'add' && (
            <AddProduct
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
              editingProduct={editProduct}
              onBack={() => { 
                setActiveMenu(null); 
                setEditProduct(null); 
              }}
            />
          )}
          
          {activeMenu === 'manage' && (
            <ManageProducts
              products={products}
              onEdit={product => { 
                setEditProduct(product); 
                setActiveMenu('add'); 
              }}
              onDelete={deleteProduct}
              onBack={() => setActiveMenu(null)}
            />
          )}
          
          {activeMenu === 'search' && (
            <SearchProducts
              onSearch={searchProducts}
              onBack={() => setActiveMenu(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}