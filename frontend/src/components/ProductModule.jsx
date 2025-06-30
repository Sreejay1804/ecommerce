import { useState } from 'react';
import AddProduct from './AddProduct';
import ManageProduct from './ManageProduct';
import SearchProduct from './SearchProduct';

export default function ProductModule() {
    const [activeView, setActiveView] = useState('main');
    
    const renderView = () => {
        switch (activeView) {
            case 'add':
                return <AddProduct onBack={() => setActiveView('main')} />;
            case 'manage':
                return <ManageProduct onBack={() => setActiveView('main')} />;
            case 'search':
                return <SearchProduct onBack={() => setActiveView('main')} />;
            default:
                return (
                    <div className="content-panel">
                        <h2 className="section-title">Product Management</h2>
                        <div className="product-actions-row" style={{ marginTop: '20px' }}>
                            <button onClick={() => setActiveView('add')} className="btn btn-blue">
                                Add New Product
                            </button>
                            <button onClick={() => setActiveView('manage')} className="btn btn-green">
                                Manage Products
                            </button>
                            <button onClick={() => setActiveView('search')} className="btn btn-purple">
                                Search Products
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="product-module">
            {renderView()}
        </div>
    );
}