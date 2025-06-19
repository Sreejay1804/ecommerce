package com.example.vendor.repository;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.example.vendor.model.Vendor;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByNameContainingIgnoreCaseOrGstNumberContainingIgnoreCase(String name, String gstNumber);
    boolean existsByGstNumber(String gstNumber);
}