package com.example.vendor.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.vendor.model.Vendor;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    
    // Search vendors by name (case-insensitive)
    List<Vendor> findByNameContainingIgnoreCase(String name);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Check if phone exists
    boolean existsByPhone(String phone);
    
    // Check if GST number exists
    boolean existsByGstNumber(String gstNumber);
    
    // Custom search query for multiple fields
    @Query("SELECT v FROM Vendor v WHERE " +
           "LOWER(v.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(v.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "v.phone LIKE CONCAT('%', :searchTerm, '%') OR " +
           "LOWER(v.address) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Vendor> searchVendors(@Param("searchTerm") String searchTerm);
}