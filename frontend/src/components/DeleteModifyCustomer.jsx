import { useEffect, useState } from 'react';

export default function DeleteModifyCustomer({ customers, onEditCustomer, onDeleteCustomer, onBack }) {
  const [sortedCustomers, setSortedCustomers] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterTerm, setFilterTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    if (customers) {
      const sorted = [...customers].sort((a, b) => {
        const aValue = a[sortField]?.toLowerCase() || '';
        const bValue = b[sortField]?.toLowerCase() || '';
        
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
      setSortedCustomers(sorted);
    }
  }, [customers, sortField, sortDirection]);

  useEffect(() => {
    if (filterTerm.trim() === '') {
      setFilteredCustomers(sortedCustomers);
    } else {
      const term = filterTerm.toLowerCase();
      const filtered = sortedCustomers.filter(customer =>
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone.includes(term) ||
        (customer.address && customer.address.toLowerCase().includes(term))
      );
      setFilteredCustomers(filtered);
    }
  }, [sortedCustomers, filterTerm]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditCustomer = (customer) => {
    // Update URL to include edit parameter
    const url = new URL(window.location);
    url.searchParams.set('edit', customer.id);
    window.history.pushState(null, '', url);
    
    onEditCustomer(customer);
  };

  const handleDeleteCustomer = async (customer) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the following customer?\n\nName: ${customer.name}\nEmail: ${customer.email}\n\nThis action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        const result = await onDeleteCustomer(customer.id);
        if (result.success) {
          alert('Customer deleted successfully!');
        } else {
          alert('Failed to delete customer: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        alert('An error occurred while deleting the customer');
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
      <h2 className="section-title">Modify or Delete Customer</h2>
      <p className="helper-text">
        Select a customer from the table below to edit or delete their information
      </p>

      <div className="controls-container" style={{ marginBottom: '24px' }}>
        <div className="form-group" style={{ maxWidth: '300px' }}>
          <label className="form-label">Filter Customers</label>
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

      {filteredCustomers.length > 0 ? (
        <div>
          <div style={{ marginBottom: '16px', color: '#6b7280', fontSize: '14px' }}>
            Showing {filteredCustomers.length} of {customers.length} customers
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
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} style={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                    <td className="table-cell">
                      <strong>{customer.name}</strong>
                    </td>
                    <td className="table-cell">{customer.email}</td>
                    <td className="table-cell">{customer.phone}</td>
                    <td className="table-cell">
                      {customer.address ? (
                        <span title={customer.address}>
                          {customer.address.length > 50 
                            ? customer.address.substring(0, 50) + '...' 
                            : customer.address}
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
                          onClick={() => handleEditCustomer(customer)}
                          className="btn-link btn-blue-link"
                          title={`Edit ${customer.name}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="btn-link btn-red-link"
                          title={`Delete ${customer.name}`}
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
      ) : customers.length === 0 ? (
        <div className="empty-message" style={{ textAlign: 'center', padding: '48px' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>No Customers Found</h3>
          <p>There are no customers in the system yet.</p>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            Add some customers first to see them here.
          </p>
        </div>
      ) : (
        <div className="empty-message" style={{ textAlign: 'center', padding: '48px' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>No Matches Found</h3>
          <p>No customers match the filter "{filterTerm}"</p>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            Try adjusting your search terms or clear the filter to see all customers.
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
}