package com.example.customermanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.customermanagement.model.Vendor;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByGstNumber(String gstNumber);
    
    @Query("SELECT v FROM Vendor v WHERE " +
           "LOWER(v.name) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(v.email) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "v.phone LIKE CONCAT('%', :term, '%') OR " +
           "LOWER(v.address) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(v.gstNumber) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Vendor> searchVendors(@Param("term") String term);
}
