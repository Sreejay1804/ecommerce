import { useState } from 'react';
import CreateVendorInvoice from './CreateVendorInvoice';
import SearchVendorInvoice from './SearchVendorInvoice';

export default function VendorInvoiceModule({ onBack }) {
  const [activePanel, setActivePanel] = useState(null);

  const renderPanel = () => {
    switch (activePanel) {
      case 'create':
        return <CreateVendorInvoice onBack={() => setActivePanel(null)} />;
      case 'search':
        return <SearchVendorInvoice onBack={() => setActivePanel(null)} />;
      default:
        return null;
    }
  };

  if (activePanel) {
    return renderPanel();
  }

  return (
    <div className="content-panel">
      <h2 className="section-title">Invoice Management</h2>
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginTop: '40px',
        justifyContent: 'center'
      }}>
        <button 
          className="btn btn-blue" 
          onClick={() => setActivePanel('create')}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            minWidth: '200px'
          }}
        >
          Create Invoice
        </button>
        <button 
          className="btn btn-green" 
          onClick={() => setActivePanel('search')}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            minWidth: '200px'
          }}
        >
          Search Invoices
        </button>
      </div>
    </div>
  );
}