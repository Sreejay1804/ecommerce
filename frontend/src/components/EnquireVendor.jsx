import { useContext, useEffect, useState } from 'react';
import { VendorContext } from '../context/VendorContext';
import vendorService from '../services/vendorService';

const EnquireVendor = () => {
  const { vendors, setVendors } = useContext(VendorContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);

  useEffect(() => {
    const fetchVendors = async () => {
      const data = await vendorService.getVendors();
      setVendors(data);
    };

    fetchVendors();
  }, [setVendors]);

  useEffect(() => {
    if (searchTerm) {
      const results = vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVendors(results);
    } else {
      setFilteredVendors(vendors);
    }
  }, [searchTerm, vendors]);

  return (
    <div>
      <h2>Enquire Vendor</h2>
      <input
        type="text"
        placeholder="Search for a vendor..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {filteredVendors.map(vendor => (
          <li key={vendor.id}>
            <h3>{vendor.name}</h3>
            <p>Email: {vendor.email}</p>
            <p>Phone: {vendor.phone}</p>
            <p>Address: {vendor.address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EnquireVendor;