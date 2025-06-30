import { useState } from 'react';

export default function SearchProducts({ onSearch, onBack }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setError(null);
    try {
      const res = await onSearch(term);
      setResults(res);
    } catch (err) {
      setError('Search failed');
    }
  };

  return (
    <div className="content-panel">
      <h2 className="section-title">Search Products</h2>
      <input
        placeholder="Search by product name or category..."
        value={term}
        onChange={e => setTerm(e.target.value)}
        style={{ width: '100%', marginBottom: 16 }}
      />
      <button className="btn btn-blue" onClick={handleSearch}>Search</button>
      <button onClick={onBack} style={{ marginLeft: 16 }}>Back</button>
      {error && <div className="error-message">{error}</div>}
      {results.length > 0 && (
        <table className="customer-table" style={{ marginTop: 24 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {results.map(prod => (
              <tr key={prod.id}>
                <td>{prod.name}</td>
                <td>{prod.category}</td>
                <td>₹{Number(prod.unitPrice).toFixed(2)}</td>
                <td>{prod.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}