import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddProduct from './components/AddProduct';
import AddProduct1 from './components/AddProduct1';
import AddVendor from './components/AddVendor';
import CreateVendorInvoice from './components/CreateVendorInvoice';
import DeleteVendor from './components/DeleteVendor';
import EnquireVendor from './components/EnquireVendor';
import ManageProducts from './components/ManageProducts';
import SearchProducts from './components/SearchProducts';
import SearchVendorInvoice from './components/SearchVendorInvoice';
import VendorInvoiceModule from './components/VendorInvoiceModule';
import { useAuth } from './contexts/AuthContext';
import { useVendor } from './contexts/VendorContext';
import './CustomerManagementApp.css';
import productService from './services/productService';
import vendorService from './services/vendorService';
//import './styles/Products.css';

const VENDOR_API = '/api/vendors';

export default function VendorManagementApp() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { vendors, setVendors } = useVendor();
  const [activeMenu, setActiveMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [productPanel, setProductPanel] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeModule, setActiveModule] = useState('vendor'); // 'vendor' or 'item'
  const [activeInvoicePage, setActiveInvoicePage] = useState(null); // null | 'create' | 'search'

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vendorService.getVendors();
      setVendors(data || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use getItems for item management module
      const data = activeModule === 'item' 
        ? await productService.getItems() 
        : await productService.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      if (activeModule === 'item') {
        setError('Unable to connect to the server. Please check if the backend is running on http://localhost:8080');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, []);

  useEffect(() => {
    // Refetch products when switching modules
    fetchProducts();
  }, [activeModule]);

  const addVendor = async (data) => {
    // Client-side validation - check for duplicates
    const emailExists = vendors.some(
      (vendor) => vendor.email.toLowerCase() === data.email.toLowerCase()
    );
    const phoneExists = vendors.some(
      (vendor) => vendor.phone === data.phone
    );
    const gstExists = vendors.some(
      (vendor) => vendor.gstNumber === data.gstNumber
    );
    
    if (emailExists) {
      return { success: false, error: 'A vendor with this email already exists' };
    }
    if (phoneExists) {
      return { success: false, error: 'A vendor with this phone number already exists' };
    }
    if (gstExists) {
      return { success: false, error: 'A vendor with this GST number already exists' };
    }

    try {
      const res = await fetch(VENDOR_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add vendor');
      }
      
      const newVendor = await res.json();
      setVendors([...vendors, newVendor]);
      return { success: true };
    } catch (err) {
      console.error('Add vendor error:', err);
      return { success: false, error: err.message };
    }
  };

  const updateVendor = async (id, data) => {
    try {
      const res = await fetch(`${VENDOR_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update vendor');
      }
      
      const updated = await res.json();
      setVendors(vendors.map(v => v.id === id ? updated : v));
      return { success: true };
    } catch (err) {
      console.error('Update vendor error:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteVendor = async (id) => {
    try {
      const res = await fetch(`${VENDOR_API}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete vendor');
      }
      setVendors(vendors.filter(v => v.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Delete vendor error:', err);
      return { success: false, error: err.message };
    }
  };

  // Product management functions for vendor module
  const addProduct = async (data) => {
    const newProd = await productService.addProduct(data);
    setProducts([...products, newProd]);
  };

  const updateProduct = async (id, data) => {
    const updated = await productService.updateProduct(id, data);
    setProducts(products.map(p => p.id === id ? updated : p));
  };

  const deleteProduct = async (id) => {
    await productService.deleteProduct(id);
    setProducts(products.filter(p => p.id !== id));
  };

  // Item management functions for item module
  const addItem = async (productData) => {
    try {
      const newProduct = await productService.addItem(productData);
      setProducts(prevProducts => [...prevProducts, newProduct]);
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateItem = async (id, productData) => {
    try {
      const updatedProduct = await productService.updateItem(id, productData);
      setProducts(prevProducts => 
        prevProducts.map(product => product.id === id ? updatedProduct : product)
      );
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteItem = async (id) => {
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
    if (activeModule === 'item') {
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
    } else {
      return await productService.searchProducts(term);
    }
  };

  const searchVendors = async (term) => {
    if (!term.trim()) return vendors;
    try {
      // Updated to use the backend search endpoint properly
      const res = await fetch(`${VENDOR_API}/search?name=${encodeURIComponent(term)}`);
      if (!res.ok) throw new Error('Search failed');
      return await res.json();
    } catch (err) {
      console.error('Search error:', err);
      // Fallback to client-side search
      return vendors.filter(v =>
        v.name.toLowerCase().includes(term.toLowerCase()) ||
        v.email.toLowerCase().includes(term.toLowerCase()) ||
        v.phone.includes(term) ||
        (v.address && v.address.toLowerCase().includes(term.toLowerCase())) ||
        (v.gstNumber && v.gstNumber.toLowerCase().includes(term.toLowerCase()))
      );
    }
  };

  const renderPanel = () => {
    switch (activeMenu) {
      case 'add':
        return (
          <AddVendor 
            onAddVendor={addVendor} 
            onUpdateVendor={updateVendor} 
            onBack={() => {
              setActiveMenu(null);
              // Remove edit parameter from URL
              const url = new URL(window.location);
              url.searchParams.delete('edit');
              window.history.pushState(null, '', url);
            }} 
            vendors={vendors}
          />
        );
      case 'enquire':
        return <EnquireVendor 
          onSearchVendors={searchVendors} 
          onBack={() => setActiveMenu(null)} 
        />;
      case 'delete':
        return <DeleteVendor 
          vendors={vendors} 
          onEditVendor={() => setActiveMenu('add')} 
          onDeleteVendor={deleteVendor} 
          onBack={() => setActiveMenu(null)} 
        />;
      default:
        return null;
    }
  };

  const renderProductPanel = () => {
    switch (productPanel) {
      case 'add':
        return <AddProduct onAddProduct={addProduct} onUpdateProduct={updateProduct} editingProduct={editingProduct} onBack={() => { setProductPanel(null); setEditingProduct(null); }} />;
      case 'manage':
        return <ManageProducts products={products} onEdit={prod => { setEditingProduct(prod); setProductPanel('add'); }} onDelete={deleteProduct} onBack={() => setProductPanel(null)} />;
      case 'search':
        return <SearchProducts onSearch={searchProducts} onBack={() => setProductPanel(null)} />;
      default:
        return (
          <div className="content-panel">
            <h2 className="section-title">Product Management</h2>
            <div className="customer-actions-row" style={{ marginTop: '20px' }}>
              <button className="btn btn-blue" onClick={() => setProductPanel('add')}>Add New Product</button>
              <button className="btn btn-green" onClick={() => setProductPanel('manage')}>Manage Products</button>
              <button className="btn btn-purple" onClick={() => setProductPanel('search')}>Search Products</button>
            </div>
          </div>
        );
    }
  };

  const renderItemManagement = () => {
    if (loading && products.length === 0) {
      return (
        <div className="content-panel">
          <h2 className="section-title">Loading products...</h2>
        </div>
      );
    }

    return (
      <>
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
                  setEditingProduct(null); 
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
          <AddProduct1
            onAddProduct={addItem}
            onUpdateProduct={updateItem}
            editingProduct={editingProduct}
            onBack={() => { 
              setActiveMenu(null); 
              setEditingProduct(null); 
            }}
          />
        )}
        
        {activeMenu === 'manage' && (
          <ManageProducts
            products={products}
            onEdit={product => { 
              setEditingProduct(product); 
              setActiveMenu('add'); 
            }}
            onDelete={deleteItem}
            onBack={() => setActiveMenu(null)}
          />
        )}
        
        {activeMenu === 'search' && (
          <SearchProducts
            onSearch={searchProducts}
            onBack={() => setActiveMenu(null)}
          />
        )}
      </>
    );
  };

  const renderVendorInvoiceModule = () => {
    if (activeInvoicePage === 'create') {
      return <CreateVendorInvoice onBack={() => setActiveInvoicePage(null)} />;
    }
    if (activeInvoicePage === 'search') {
      return <SearchVendorInvoice onBack={() => setActiveInvoicePage(null)} />;
    }
    return (
      <VendorInvoiceModule
        onCreateInvoice={() => setActiveInvoicePage('create')}
        onSearchInvoice={() => setActiveInvoicePage('search')}
      />
    );
  };

  const renderVendorButtons = () => {
    if (!activeMenu && !activeInvoicePage) {
      return (
        <div className="content-panel">
          <h2 className="section-title">Vendor Management</h2>
          <div className="customer-actions-row" style={{ marginTop: '20px' }}>
            <button 
              onClick={() => setActiveMenu('add')} 
              className="btn btn-blue"
            >
              Add Vendor
            </button>
            <button 
              onClick={() => setActiveMenu('enquire')} 
              className="btn btn-green"
            >
              Enquire Vendor
            </button>
            <button 
              onClick={() => setActiveMenu('delete')} 
              className="btn btn-red"
            >
              Delete/Modify Vendor
            </button>
            <button
              onClick={() => setActiveInvoicePage('module')}
              className="btn btn-purple"
            >
              Invoice
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderVendorList = () => {
    if (activeMenu !== null || activeInvoicePage) return null;

    return (
      <div className="table-container">
        <h2 className="section-subtitle">Vendor List</h2>
        {loading ? (
          <p className="helper-text">Loading vendors...</p>
        ) : error ? (
          <div className="error-message">
            <p>Error loading vendors: {error}</p>
            <button onClick={fetchVendors} className="btn btn-blue">Retry</button>
          </div>
        ) : vendors.length > 0 ? (
          <div className="table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>GST Number</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(vendor => (
                  <tr key={vendor.id}>
                    <td>{vendor.name}</td>
                    <td>{vendor.email}</td>
                    <td>{vendor.phone}</td>
                    <td>{vendor.address || 'N/A'}</td>
                    <td>{vendor.gstNumber || 'N/A'}</td>
                    <td>{vendor.description || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleEditFromList(vendor)} 
                          className="btn-link btn-blue-link"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteFromList(vendor)} 
                          className="btn-link btn-red-link btn-red-link:hover"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-message">No vendors available. Add a vendor to see them listed here.</p>
        )}
      </div>
    );
  };

  const handleEditFromList = (vendor) => {
    // Update URL to include edit parameter
    const url = new URL(window.location);
    url.searchParams.set('edit', vendor.id);
    window.history.pushState(null, '', url);
    
    // Switch to edit mode
    setActiveMenu('add');
  };

  const handleDeleteFromList = async (vendor) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${vendor.name}?`
    );
    
    if (confirmDelete) {
      try {
        const result = await deleteVendor(vendor.id);
        if (result.success) {
          alert('Vendor deleted successfully!');
        } else {
          alert('Failed to delete vendor: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        alert('An error occurred while deleting the vendor');
        console.error('Delete error:', error);
      }
    }
  };

  const handleModuleSwitch = (module) => {
    setActiveModule(module);
    setActiveMenu(null);
    setProductPanel(null);
    setEditingProduct(null);
    setActiveInvoicePage(null);
    setError(null);
  };

  const renderDashboard = () => {
    return (
      <div className="content-panel">
        <h2 className="section-title">Dashboard</h2>
        <div className="customer-actions-row" style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
          <button 
            className="btn btn-blue" 
            onClick={() => setActiveMenu('add')}
          >
            Add Vendor
          </button>
          <button 
            className="btn btn-green" 
            onClick={() => setActiveMenu('enquire')}
          >
            Enquire Vendor
          </button>
          <button 
            className="btn btn-red" 
            onClick={() => setActiveMenu('delete')}
          >
            Delete/Modify Vendor
          </button>
        </div>
      </div>
    );
  };

  // Add responsive styles for mobile screens
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media (max-width: 600px) {
        .app-container {
          flex-direction: column !important;
        }
        .sidebar {
          width: 100vw !important;
          min-width: 0 !important;
          max-width: 100vw !important;
          height: auto !important;
          position: static !important;
          background-attachment: scroll !important;
        }
        .sidebar-header, .sidebar-content, .sidebar-footer {
          align-items: flex-start !important;
        }
        .main-container {
          width: 100vw !important;
          padding: 0 !important;
        }
        .main-content {
          padding: 8px !important;
        }
        .content-panel, .table-container {
          padding: 8px !important;
        }
        .customer-actions-row {
          flex-direction: column !important;
          gap: 8px !important;
        }
        .customer-table th, .customer-table td {
          font-size: 12px !important;
          padding: 4px !important;
        }
        .table-wrapper {
          overflow-x: auto !important;
        }
        .btn, .btn-link {
          font-size: 14px !important;
          padding: 6px 10px !important;
        }
        .section-title, .section-subtitle {
          font-size: 18px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="app-container">
      <div className="sidebar" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        backgroundImage: 'url("/sidebar-bg.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
      }}>
        <div>
          <div className="sidebar-header">
            <h1 
              className="sidebar-title"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                navigate('/dashboard'); // Use your dashboard route here
              }}
            >
              Dashboard
            </h1>
          </div>
          <div className="sidebar-content">
            <div className="sidebar-item">
              <button 
                onClick={() => {
                  setActiveModule('vendor');
                  setActiveMenu(null);
                  setProductPanel(null);
                  setEditingProduct(null);
                  setActiveInvoicePage(null);
                  setError(null);
                }} 
                className={`sidebar-button${activeModule === 'vendor' ? ' active' : ''}`}
              >
                Vendor
              </button>
            </div>
            <div className="sidebar-item">
              <button 
                onClick={() => handleModuleSwitch('item')} 
                className={`sidebar-button${activeModule === 'item' ? ' active' : ''}`}
              >
                Items
              </button>
            </div>
            <div className="sidebar-item">
              <button
                onClick={() => {
                  setActiveModule('vendor');
                  setActiveMenu(null);
                  setProductPanel(null);
                  setEditingProduct(null);
                  setActiveInvoicePage('module'); // Always show VendorInvoiceModule
                  setError(null);
                }}
                className={`sidebar-button${activeInvoicePage ? ' active' : ''}`}
              >
                Invoice
              </button>
            </div>
          </div>
        </div>
        {/* Spacer to push logout to the bottom */}
        <div style={{ flex: 1 }}></div>
        <div className="sidebar-footer" style={{ padding: '16px', marginTop: 'auto' }}>
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              
              <button className="btn btn-logout" onClick={logout}>Logout</button>
              <span style={{ fontSize: '14px', marginBottom: '8px' }}>Logged in as <b>{user.username}</b></span>
              
            </div>
          )}
        </div>
      </div>

      <div className="main-container">
        <main className="main-content">
          {activeModule === 'vendor' ? (
            <>
              {activeMenu === null && !activeInvoicePage && renderDashboard()}
              {activeInvoicePage && renderVendorInvoiceModule()}
              {!activeInvoicePage && activeMenu !== null && (
                <>
                  {renderPanel()}
                  {renderVendorList()}
                  {productPanel !== null && renderProductPanel()}
                </>
              )}
            </>
          ) : (
            renderItemManagement()
          )}
        </main>
      </div>
    </div>
  );
}