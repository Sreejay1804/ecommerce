package com.example.customermanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.customermanagement.model.Customer;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    // Email existence check
    boolean existsByEmail(String email);
    
    // Find by email
    @Query("SELECT c FROM Customer c WHERE LOWER(c.email) = LOWER(:email)")
    Optional<Customer> findByEmail(@Param("email") String email);
    
    // Get all customers ordered by name
    List<Customer> findAllByOrderByNameAsc();
    
    // Search by single term across multiple fields
    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.address) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Customer> findBySearchTerm(@Param("searchTerm") String searchTerm);
    
    // Individual field searches (if needed)
    @Query("SELECT c FROM Customer c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Customer> findByNameContainingIgnoreCase(@Param("name") String name);
    
    @Query("SELECT c FROM Customer c WHERE LOWER(c.email) LIKE LOWER(CONCAT('%', :email, '%'))")
    List<Customer> findByEmailContainingIgnoreCase(@Param("email") String email);
}