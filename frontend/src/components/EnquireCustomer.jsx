import { useState } from 'react';

export default function EnquireCustomer({ onSearchCustomers, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

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
      const results = await onSearchCustomers(term);
      
      // Sort results alphabetically by name
      const sortedResults = [...results].sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      
      setSearchResults(sortedResults);
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
    setSearchResults([]);
    setHasSearched(false);
    setSearchError('');
  };

  return (
    <div className="content-panel">
      <h2 className="section-title">Customer Enquiry</h2>
      <p className="helper-text">Search for customer information by name or email</p>
      
      <div className="search-container" style={{ marginBottom: '24px' }}>
        <div className="form-group">
          <label className="form-label">Search Term</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            className="form-input"
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
            <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>
              {searchError}
            </div>
          )}
        </div>
        
        <div className="button-group">
          <button 
            onClick={handleSearch} 
            className="btn btn-blue"
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
        <div className="search-results">
          <h3 className="section-title" style={{ fontSize: '18px', marginBottom: '16px' }}>
            Search Results {searchResults.length > 0 && `(${searchResults.length} found)`}
          </h3>
          
          {searchResults.length > 0 ? (
            <div className="table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Phone</th>
                    <th className="table-header">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((customer) => (
                    <tr key={customer.id}>
                      <td className="table-cell">
                        <strong>{customer.name}</strong>
                      </td>
                      <td className="table-cell">{customer.email}</td>
                      <td className="table-cell">{customer.phone}</td>
                      <td className="table-cell">
                        {customer.address || 'No address provided'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-message" style={{ textAlign: 'center', padding: '24px' }}>
              <p>No customers found matching "{searchTerm}"</p>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                Try searching with a different name or email address
              </p>
            </div>
          )}
        </div>
      )}
      
      {!hasSearched && searchTerm && (
        <div className="helper-text" style={{ textAlign: 'center', padding: '24px' }}>
          <p>Click "Search" to find customers matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}