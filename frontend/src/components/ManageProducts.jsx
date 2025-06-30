
export default function ManageProducts({ products, onEdit, onDelete, onBack }) {
  // Add defensive check to ensure products is an array
  const productList = products || [];

  return (
    <div className="content-panel">
      <h2 className="section-title">Manage Products</h2>
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
          {productList.map(prod => (
            <tr key={prod.id}>
              <td>{prod.name}</td>
              <td>{prod.category}</td>
              <td>₹{Number(prod.unitPrice).toFixed(2)}</td>
              <td>
                <button className="btn-link btn-blue-link" onClick={() => onEdit(prod)}>Edit</button>
                <button className="btn-link btn-red-link" onClick={() => onDelete(prod.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {productList.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          No products found.
        </p>
      )}
      <button className="btn btn-blue:hover" onClick={onBack} >Back</button>
    </div>
  );
}