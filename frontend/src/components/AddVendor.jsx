import { useContext, useState } from 'react';
import { VendorContext } from '../context/VendorContext';

const AddVendor = () => {
  const { addVendor } = useContext(VendorContext);
  const [vendorData, setVendorData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVendorData({ ...vendorData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addVendor(vendorData);
    setVendorData({ name: '', email: '', phone: '', address: '' });
  };

  return (
    <div className="add-vendor-container">
      <h2>Add New Vendor</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={vendorData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={vendorData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Phone:</label>
          <input
            type="text"
            name="phone"
            value={vendorData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={vendorData.address}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Add Vendor</button>
      </form>
    </div>
  );
};

export default AddVendor;