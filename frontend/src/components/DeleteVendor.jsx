import { useContext, useState } from 'react';
import { VendorContext } from '../context/VendorContext';

const DeleteVendor = ({ vendorId }) => {
  const { deleteVendor } = useContext(VendorContext);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (confirmDelete) {
      await deleteVendor(vendorId);
      // Optionally, you can redirect or show a success message here
    }
  };

  return (
    <div>
      <h2>Delete Vendor</h2>
      <p>Are you sure you want to delete this vendor?</p>
      <button onClick={() => setConfirmDelete(true)}>Yes, Delete</button>
      <button onClick={() => setConfirmDelete(false)}>Cancel</button>
      {confirmDelete && (
        <div>
          <p>Confirm deletion of vendor ID: {vendorId}</p>
          <button onClick={handleDelete}>Confirm Delete</button>
        </div>
      )}
    </div>
  );
};

export default DeleteVendor;