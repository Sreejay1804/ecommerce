    package com.example.customermanagement.service;

    import java.util.List;

import com.example.customermanagement.model.Customer;

    public interface CustomerService {
        List<Customer> getAllCustomers();
        Customer getCustomerById(Long id);
        Customer createCustomer(Customer customer);
        Customer updateCustomer(Long id, Customer customer);
        void deleteCustomer(Long id);
        List<Customer> searchCustomers(String searchTerm);
        boolean existsByEmail(String email);
    }
