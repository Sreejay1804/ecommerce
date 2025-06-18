import { createContext, useContext, useState } from 'react';
import vendorService from '../services/vendorService';

export const VendorContext = createContext();

export const VendorProvider = ({ children }) => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const addVendor = async (vendorData) => {
        try {
            const newVendor = await vendorService.addVendor(vendorData);
            setVendors(prev => [...prev, newVendor]);
            return newVendor;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const deleteVendor = async (vendorId) => {
        try {
            await vendorService.deleteVendor(vendorId);
            setVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updateVendors = (newVendors) => {
        setVendors(newVendors);
    };

    return (
        <VendorContext.Provider 
            value={{ 
                vendors, 
                loading, 
                error, 
                addVendor, 
                deleteVendor, 
                updateVendors,
                setVendors,
                setLoading,
                setError 
            }}
        >
            {children}
        </VendorContext.Provider>
    );
};

export const useVendor = () => {
    const context = useContext(VendorContext);
    if (!context) {
        throw new Error('useVendor must be used within a VendorProvider');
    }
    return context;
};