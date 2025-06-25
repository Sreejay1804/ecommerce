const API_BASE_URL = '/api/vendors';

// Create axios-like functionality with proper error handling
const apiRequest = async (url, options = {}) => {
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses (like DELETE)
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

const vendorService = {
  // Get all vendors
  getVendors: async () => {
    return await apiRequest(API_BASE_URL);
  },

  // Get vendor by ID
  getVendorById: async (id) => {
    return await apiRequest(`${API_BASE_URL}/${id}`);
  },

  // Create new vendor
  createVendor: async (vendorData) => {
    return await apiRequest(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  },

  // Update vendor
  updateVendor: async (id, vendorData) => {
    return await apiRequest(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vendorData),
    });
  },

  // Delete vendor
  deleteVendor: async (id) => {
    return await apiRequest(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },

  // Search vendors
  searchVendors: async (searchTerm) => {
    const encodedTerm = encodeURIComponent(searchTerm || '');
    return await apiRequest(`${API_BASE_URL}/search?term=${encodedTerm}`);
  },

  // Test connection
  testConnection: async () => {
    try {
      await apiRequest(API_BASE_URL);
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to connect to server' 
      };
    }
  }
};

export default vendorService;