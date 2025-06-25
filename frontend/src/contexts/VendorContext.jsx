// frontend/src/contexts/VendorContext.jsx

import { createContext, useContext, useState } from 'react';
import vendorService from '../services/vendorService';

const VendorContext = createContext();

export const useVendor = () => {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
};

export const VendorProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vendorService.getVendors();
      setVendors(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching vendors:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addVendor = async (vendorData) => {
    try {
      const newVendor = await vendorService.createVendor(vendorData);
      setVendors(prev => [...prev, newVendor]);
      return { success: true, data: newVendor };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateVendor = async (id, vendorData) => {
    try {
      const updatedVendor = await vendorService.updateVendor(id, vendorData);
      setVendors(prev => prev.map(v => v.id === id ? updatedVendor : v));
      return { success: true, data: updatedVendor };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteVendor = async (id) => {
    try {
      await vendorService.deleteVendor(id);
      setVendors(prev => prev.filter(v => v.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const searchVendors = async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return vendors;
      }
      const results = await vendorService.searchVendors(searchTerm);
      return results;
    } catch (err) {
      console.error('Error searching vendors:', err);
      // Fallback to local search
      const term = searchTerm.toLowerCase();
      return vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(term) ||
        vendor.email.toLowerCase().includes(term) ||
        vendor.phone.includes(term) ||
        (vendor.address && vendor.address.toLowerCase().includes(term))
      );
    }
  };

  const value = {
    vendors,
    setVendors,
    loading,
    error,
    fetchVendors,
    addVendor,
    updateVendor,
    deleteVendor,
    searchVendors,
  };

  return (
    <VendorContext.Provider value={value}>
      {children}
    </VendorContext.Provider>
  );
};

export { VendorContext };
