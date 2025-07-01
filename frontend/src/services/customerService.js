import axios from 'axios';

const API_BASE_URL = 'https://ecommerce-lce3.onrender.com/api/customers';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const customerService = {
  // Get all customers
  getAllCustomers: () => api.get(''),
  
  // Get customer by ID
  getCustomerById: (id) => api.get(`/${id}`),
  
  // Search customers
  searchCustomers: (term) => api.get(`/search?term=${term}`),
  
  // Create new customer
  createCustomer: (customer) => api.post('', customer),
  
  // Update customer
  updateCustomer: (id, customer) => api.put(`/${id}`, customer),
  
  // Delete customer
  deleteCustomer: (id) => api.delete(`/${id}`),
};