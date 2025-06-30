import { useContext, useEffect, useState } from 'react';
import { VendorContext } from '../contexts/VendorContext';

const DeleteModifyVendor = ({ onEditVendor, onBack }) => {
  const { vendors, deleteVendor } = useContext(VendorContext);
  const [sortedVendors, setSortedVendors] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterTerm, setFilterTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);

  useEffect(() => {
    if (vendors) {
      const sorted = [...vendors].sort((a, b) => {
        const aValue = a[sortField]?.toLowerCase() || '';
        const bValue = b[sortField]?.toLowerCase() || '';
        
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
      setSortedVendors(sorted);
    }
  }, [vendors, sortField, sortDirection]);

  useEffect(() => {
    if (filterTerm.trim() === '') {
      setFilteredVendors(sortedVendors);
    } else {
      const term = filterTerm.toLowerCase();
      const filtered = sortedVendors.filter(vendor =>
        vendor.name.toLowerCase().includes(term) ||
        vendor.email.toLowerCase().includes(term) ||
        vendor.phone.includes(term) ||
        (vendor.address && vendor.address.toLowerCase().includes(term))
      );
      setFilteredVendors(filtered);
    }
  }, [sortedVendors, filterTerm]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditVendor = (vendor) => {
    // Update URL to include edit parameter
    const url = new URL(window.location);
    url.searchParams.set('edit', vendor.id);
    window.history.pushState(null, '', url);
    
    onEditVendor(vendor);
  };

  const handleDeleteVendor = async (vendor) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the following vendor?\n\nName: ${vendor.name}\nEmail: ${vendor.email}\n\nThis action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        const result = await deleteVendor(vendor.id);
        if (result && result.success !== false) {
          alert('Vendor deleted successfully!');
        } else {
          alert('Failed to delete vendor: ' + (result?.error || 'Unknown error'));
        }
      } catch (error) {
        alert('An error occurred while deleting the vendor');
        console.error('Delete error:', error);
      }
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="content-panel">
      <h2 className="section-title">Modify or Delete Vendor</h2>
      <p className="helper-text">
        Select a vendor from the table below to edit or delete their information
      </p>

      <div className="controls-container" style={{ marginBottom: '24px' }}>
        <div className="form-group" style={{ maxWidth: '300px' }}>
          <label className="form-label">Filter Vendors</label>
          <input
            type="text"
            placeholder="Filter by name, email, phone, or address..."
            className="form-input"
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            maxLength="100"
          />
        </div>
        
        <div className="button-group">
          <button onClick={onBack} className="btn btn-gray">
            Back to Options
          </button>
        </div>
      </div>

      {filteredVendors.length > 0 ? (
        <div>
          <div style={{ marginBottom: '16px', color: '#6b7280', fontSize: '14px' }}>
            Showing {filteredVendors.length} of {vendors.length} vendors
            {filterTerm && ` matching "${filterTerm}"`}
          </div>
          
          <div className="table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th 
                    className="table-header sortable-header" 
                    onClick={() => handleSort('name')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort by name"
                  >
                    Name {getSortIcon('name')}
                  </th>
                  <th 
                    className="table-header sortable-header" 
                    onClick={() => handleSort('email')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort by email"
                  >
                    Email {getSortIcon('email')}
                  </th>
                  <th 
                    className="table-header sortable-header" 
                    onClick={() => handleSort('phone')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort by phone"
                  >
                    Phone {getSortIcon('phone')}
                  </th>
                  <th className="table-header">Address</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} style={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                    <td className="table-cell">
                      <strong>{vendor.name}</strong>
                    </td>
                    <td className="table-cell">{vendor.email}</td>
                    <td className="table-cell">{vendor.phone}</td>
                    <td className="table-cell">
                      {vendor.address ? (
                        <span title={vendor.address}>
                          {vendor.address.length > 50 
                            ? vendor.address.substring(0, 50) + '...' 
                            : vendor.address}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                          No address
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditVendor(vendor)}
                          className="btn-link btn-blue-link"
                          title={`Edit ${vendor.name}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(vendor)}
                          className="btn-link btn-red-link"
                          title={`Delete ${vendor.name}`}
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
        </div>
      ) : vendors.length === 0 ? (
        <div className="empty-message" style={{ textAlign: 'center', padding: '48px' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>No Vendors Found</h3>
          <p>There are no vendors in the system yet.</p>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            Add some vendors first to see them here.
          </p>
        </div>
      ) : (
        <div className="empty-message" style={{ textAlign: 'center', padding: '48px' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>No Matches Found</h3>
          <p>No vendors match the filter "{filterTerm}"</p>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            Try adjusting your search terms or clear the filter to see all vendors.
          </p>
          <button
            onClick={() => setFilterTerm('')}
            className="btn btn-blue"
            style={{ marginTop: '16px' }}
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default DeleteModifyVendor;