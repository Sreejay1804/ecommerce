package com.example.customermanagement.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.customermanagement.exception.CustomerNotFoundException;
import com.example.customermanagement.exception.DuplicateEmailException;
import com.example.customermanagement.model.Customer;
import com.example.customermanagement.repository.CustomerRepository;

@Service
@Transactional
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Override
    public List<Customer> getAllCustomers() {
        return customerRepository.findAllByOrderByNameAsc();
    }

    @Override
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + id));
    }

    @Override
    public Customer createCustomer(Customer customer) {
        String email = customer.getEmail().toLowerCase().trim();
        if (customerRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("A customer with email " + email + " already exists");
        }

        sanitizeCustomerData(customer);
        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Long id, Customer customerDetails) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + id));

        String newEmail = customerDetails.getEmail().toLowerCase().trim();
        if (!customer.getEmail().equals(newEmail) && customerRepository.existsByEmail(newEmail)) {
            throw new DuplicateEmailException("A customer with email " + newEmail + " already exists");
        }

        customer.setName(customerDetails.getName().trim());
        customer.setEmail(newEmail);
        customer.setPhone(customerDetails.getPhone().replaceAll("\\D", ""));
        customer.setAddress(customerDetails.getAddress() != null ? customerDetails.getAddress().trim() : null);

        return customerRepository.save(customer);
    }

    @Override
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + id));
        customerRepository.delete(customer);
    }

    @Override
    public List<Customer> searchCustomers(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllCustomers();
        }
        return customerRepository.findBySearchTerm(searchTerm.trim());
    }

    @Override
    public boolean existsByEmail(String email) {
        return customerRepository.existsByEmail(email.toLowerCase().trim());
    }

    private void sanitizeCustomerData(Customer customer) {
        customer.setName(customer.getName().trim());
        customer.setEmail(customer.getEmail().toLowerCase().trim());
        customer.setPhone(customer.getPhone().replaceAll("\\D", ""));
        customer.setAddress(customer.getAddress() != null ? customer.getAddress().trim() : null);
    }
}
