// components/InvoiceModule.jsx
import React from 'react';

export default function InvoiceModule({ handleBack, onCreate, onSearch }) {
  return (
    <div className="content-panel">
      <h2 className="section-title">Invoice Management</h2>

      <div className="options-grid">
        <button className="btn btn-blue" onClick={onCreate}>Create Invoice</button>
        <button className="btn btn-green" onClick={onSearch}>Search Invoice</button>
      </div>

      <div className="button-group" style={{ marginTop: '24px' }}>
        <button onClick={handleBack} className="btn btn-gray">Back</button>
      </div>
    </div>
  );
}