const BASE_URL = 'http://localhost:8080/api/vendors';

const vendorService = {
    getVendors: async () => {
        try {
            const response = await fetch(BASE_URL);
            if (!response.ok) throw new Error('Failed to fetch vendors');
            return await response.json();
        } catch (error) {
            console.error('Error fetching vendors:', error);
            throw error;
        }
    },

    getVendorById: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`);
            if (!response.ok) throw new Error('Failed to fetch vendor');
            return await response.json();
        } catch (error) {
            console.error('Error fetching vendor:', error);
            throw error;
        }
    },

    addVendor: async (vendorData) => {
        try {
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(vendorData),
            });
            if (!response.ok) throw new Error('Failed to add vendor');
            return await response.json();
        } catch (error) {
            console.error('Error adding vendor:', error);
            throw error;
        }
    },

    updateVendor: async (id, vendorData) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`, {
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

    deleteVendor: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete vendor');
            return true;
        } catch (error) {
            console.error('Error deleting vendor:', error);
            throw error;
        }
    },

    searchVendors: async (name) => {
        try {
            const response = await fetch(`${BASE_URL}/search?name=${encodeURIComponent(name)}`);
            if (!response.ok) throw new Error('Failed to search vendors');
            return await response.json();
        } catch (error) {
            console.error('Error searching vendors:', error);
            throw error;
        }
    }
};

export default vendorService;