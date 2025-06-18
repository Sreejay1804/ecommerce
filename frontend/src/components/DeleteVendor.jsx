import { useContext, useState } from 'react';
import { VendorContext } from '../contexts/VendorContext';

const DeleteVendor = ({ vendorId }) => {
  const { deleteVendor } = useContext(VendorContext);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (confirmDelete) {
      await deleteVendor(vendorId);
    }
  };

  return (
    <div className="content-panel">
      <h2 className="section-title">Delete Vendor</h2>
      <div className="delete-confirmation">
        <div className="warning-icon">⚠️</div>
        <p className="warning-text">Are you sure you want to delete this vendor?</p>
        <p className="warning-subtext">This action cannot be undone.</p>
        
        <div className="button-group">
          {!confirmDelete ? (
            <>
              <button 
                className="btn btn-red"
                onClick={() => setConfirmDelete(true)}
              >
                Yes, Delete
              </button>
              <button 
                className="btn btn-gray"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <div className="final-confirmation">
              <p className="confirmation-text">
                Confirm deletion of vendor ID: {vendorId}
              </p>
              <div className="button-group">
                <button 
                  className="btn btn-red"
                  onClick={handleDelete}
                >
                  Confirm Delete
                </button>
                <button 
                  className="btn btn-gray"
                  onClick={() => setConfirmDelete(false)}
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteVendor;