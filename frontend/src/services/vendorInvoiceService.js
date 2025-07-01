const API_BASE_URL = 'https://ecommerce-lce3.onrender.com/api/vendor-invoices';

// Example function to fetch vendor invoices (customize as needed)
export const getVendorInvoices = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};
