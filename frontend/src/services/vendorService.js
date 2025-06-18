const BASE_URL = 'http://localhost:8080/api';

const vendorService = {
  getVendors: async () => {
    try {
      const response = await fetch(`${BASE_URL}/vendors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any auth headers if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return []; // Return empty array instead of throwing error
    }
  },

  getVendorById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/vendors/${id}`);
      if (!response.ok) throw new Error('Failed to fetch vendor');
      return await response.json();
    } catch (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }
  },

  addVendor: async (vendorData) => {
    try {
      const response = await fetch(`${BASE_URL}/vendors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding vendor:', error);
      throw error;
    }
  },

  updateVendor: async (id, vendorData) => {
    try {
      const response = await fetch(`${BASE_URL}/vendors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      });
      if (!response.ok) throw new Error('Failed to update vendor');
      return await response.json();
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  },

  deleteVendor: async (vendorId) => {
    try {
      const response = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  },

  searchVendors: async (name) => {
    try {
      const response = await fetch(`${BASE_URL}/vendors/search?name=${encodeURIComponent(name)}`);
      if (!response.ok) throw new Error('Failed to search vendors');
      return await response.json();
    } catch (error) {
      console.error('Error searching vendors:', error);
      throw error;
    }
  }
};

export default vendorService;