import { useContext, useEffect, useState } from 'react';
import { VendorContext } from '../contexts/VendorContext';
import vendorService from '../services/vendorService';
import '../styles/VendorManagement.css';

const EnquireVendor = ({ onSearchVendors, onBack }) => {
  const { vendors, setVendors } = useContext(VendorContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearch = async () => {
    const term = searchTerm.trim();
    
    if (!term) {
      setSearchError('Please enter a search term');
      return;
    }

    if (term.length < 2) {
      setSearchError('Search term must be at least 2 characters long');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setHasSearched(false);

    try {
      const results = await onSearchVendors(term);
      
      // Sort results alphabetically by name
      const sortedResults = [...results].sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      
      setFilteredVendors(sortedResults);
      setHasSearched(true);
    } catch (error) {
      setSearchError('An error occurred while searching. Please try again.');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredVendors(vendors);
    setHasSearched(false);
    setSearchError('');
  };

  return (
    <div className="content-panel full-width">
      <div className="panel-header left-aligned">
        <h2 className="section-title">Enquire Vendor</h2>
      </div>
      
      <div className="search-container full-width">
        <div className="form-group full-width">
          <label className="form-label">Search Term</label>
          <input
            type="text"
            placeholder="Search by name or GST number..."
            className="form-input full-width"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (searchError) setSearchError('');
            }}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
            maxLength="100"
          />
          {searchError && (
            <div className="error-message">{searchError}</div>
          )}
        </div>
        
        <div className="button-group left-aligned full-width">
          <button 
            onClick={handleSearch} 
            className="btn btn-blue search-btn"
            disabled={isSearching || !searchTerm.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={handleClearSearch}
            className="btn btn-gray"
            disabled={isSearching}
          >
            Clear
          </button>
          <button
            onClick={onBack}
            className="btn btn-gray"
            disabled={isSearching}
          >
            Back
          </button>
        </div>
      </div>
      
      {hasSearched && (
        <div className="search-results full-width">
          <h3 className="results-title">
            Search Results {filteredVendors.length > 0 && `(${filteredVendors.length} found)`}
          </h3>
          
          {filteredVendors.length > 0 ? (
            <div className="table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Description</th>
                    <th>GST Number</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.id}>
                      <td><strong>{vendor.name}</strong></td>
                      <td>{vendor.address || 'N/A'}</td>
                      <td>{vendor.description || 'N/A'}</td>
                      <td>{vendor.gstNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-message">
              <p>No vendors found matching "{searchTerm}"</p>
              <p className="helper-text">Try searching with a different name or GST number</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnquireVendor;