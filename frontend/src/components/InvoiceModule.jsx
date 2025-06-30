// components/InvoiceModule.jsx

export default function InvoiceModule({ onCreate, onSearch }) {
  return (
    <div className="content-panel">
      <h2 className="section-title">Invoice Management</h2>
      <div className="invoice-actions-row" style={{ marginTop: '20px' }}>
        <button className="btn btn-blue" onClick={onCreate}>Create Invoice</button>
        <button className="btn btn-green" onClick={onSearch}>Search Invoices</button>
      </div>
    </div>
  );
}