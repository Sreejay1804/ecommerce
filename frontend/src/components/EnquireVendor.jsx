import { useContext, useEffect, useState } from 'react';
import { VendorContext } from '../contexts/VendorContext';
import vendorService from '../services/vendorService';
import '../styles/VendorManagement.css';

const EnquireVendor = () => {
  const { vendors, setVendors } = useContext(VendorContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const data = await vendorService.getVendors();
        setVendors(data);
        setFilteredVendors(data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [setVendors]);

  useEffect(() => {
    if (searchTerm) {
      const results = vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.phone.includes(searchTerm)
      );
      setFilteredVendors(results);
    } else {
      setFilteredVendors(vendors);
    }
  }, [searchTerm, vendors]);

  return (
    <div className="enquire-vendor-container">
      <div className="search-section">
        <h2 className="section-title">Enquire Vendor</h2>
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <p className="results-count">
          {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="vendor-grid">
        {loading ? (
          <div className="loading-spinner">Loading vendors...</div>
        ) : filteredVendors.length === 0 ? (
          <div className="no-results">
            <span className="no-results-icon">🔎</span>
            <p>No vendors found matching your search</p>
            {searchTerm && (
              <button 
                className="btn btn-blue"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredVendors.map(vendor => (
            <div key={vendor.id} className="vendor-card">
              <div className="vendor-card-header">
                <span className="vendor-icon">👤</span>
                <h3 className="vendor-name">{vendor.name}</h3>
              </div>
              <div className="vendor-card-content">
                <div className="vendor-detail">
                  <span className="detail-icon">📧</span>
                  <span className="detail-text">{vendor.email}</span>
                </div>
                <div className="vendor-detail">
                  <span className="detail-icon">📞</span>
                  <span className="detail-text">{vendor.phone}</span>
                </div>
                <div className="vendor-detail">
                  <span className="detail-icon">📍</span>
                  <span className="detail-text">{vendor.address}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EnquireVendor;