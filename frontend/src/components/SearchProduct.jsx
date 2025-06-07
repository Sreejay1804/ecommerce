import { useState } from 'react';

export default function SearchProduct({ onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8080/api/products/search?term=${encodeURIComponent(searchTerm.trim())}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data);
      setHasSearched(true);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-panel">
      <h2 className="section-title">Search Products</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by product name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          style={{ marginBottom: '1rem' }}
        />
        <div className="button-group">
          <button onClick={handleSearch} className="btn btn-blue" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button onClick={onBack} className="btn btn-gray" disabled={loading}>
            Back
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ color: 'red', marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {hasSearched && (
        <div className="search-results" style={{ marginTop: '2rem' }}>
          <h3>Search Results</h3>
          {searchResults.length > 0 ? (
            <div className="table-wrapper">
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
                  {searchResults.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>₹{parseFloat(product.unitPrice).toFixed(2)}</td>
                      <td>{product.description || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-message">No products found matching your search.</p>
          )}
        </div>
      )}
    </div>
  );
}