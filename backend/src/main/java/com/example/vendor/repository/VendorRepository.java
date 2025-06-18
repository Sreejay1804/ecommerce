package com.example.vendor.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.vendor.model.Vendor;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByNameContainingIgnoreCase(String name);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}