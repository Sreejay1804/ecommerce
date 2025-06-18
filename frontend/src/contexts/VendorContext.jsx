import { createContext, useEffect, useState } from 'react';
import vendorService from '../services/vendorService';

export const VendorContext = createContext();

export const VendorProvider = ({ children }) => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const data = await vendorService.getVendors();
                setVendors(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVendors();
    }, []);

    const addVendor = async (vendorData) => {
        try {
            const newVendor = await vendorService.addVendor(vendorData);
            setVendors([...vendors, newVendor]);
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteVendor = async (vendorId) => {
        try {
            await vendorService.deleteVendor(vendorId);
            setVendors(vendors.filter(vendor => vendor.id !== vendorId));
        } catch (err) {
            setError(err.message);
        }
    };

    const enquireVendor = async (vendorId) => {
        try {
            const vendor = await vendorService.getVendorById(vendorId);
            return vendor;
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <VendorContext.Provider value={{ vendors, loading, error, addVendor, deleteVendor, enquireVendor }}>
            {children}
        </VendorContext.Provider>
    );
};