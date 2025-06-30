package com.example.vendor.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.vendor.model.Vendor;
import com.example.vendor.repository.VendorRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class VendorService {
    
    @Autowired
    private VendorRepository vendorRepository;

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id: " + id));
    }

    public Vendor createVendor(Vendor vendor) {
        // Check for duplicate email
        if (vendorRepository.existsByEmail(vendor.getEmail())) {
            throw new IllegalArgumentException("A vendor with this email already exists");
        }
        
        // Check for duplicate phone
        if (vendorRepository.existsByPhone(vendor.getPhone())) {
            throw new IllegalArgumentException("A vendor with this phone number already exists");
        }
        
        // Check for duplicate GST number
        if (vendorRepository.existsByGstNumber(vendor.getGstNumber())) {
            throw new IllegalArgumentException("A vendor with this GST number already exists");
        }
        
        return vendorRepository.save(vendor);
    }

    public Vendor updateVendor(Long id, Vendor vendorDetails) {
        Vendor vendor = getVendorById(id);
        
        // Check for duplicate email (excluding current vendor)
        if (!vendor.getEmail().equals(vendorDetails.getEmail()) && 
            vendorRepository.existsByEmail(vendorDetails.getEmail())) {
            throw new IllegalArgumentException("A vendor with this email already exists");
        }
        
        // Check for duplicate phone (excluding current vendor)
        if (!vendor.getPhone().equals(vendorDetails.getPhone()) && 
            vendorRepository.existsByPhone(vendorDetails.getPhone())) {
            throw new IllegalArgumentException("A vendor with this phone number already exists");
        }
        
        // Check for duplicate GST number (excluding current vendor)
        if (!vendor.getGstNumber().equals(vendorDetails.getGstNumber()) && 
            vendorRepository.existsByGstNumber(vendorDetails.getGstNumber())) {
            throw new IllegalArgumentException("A vendor with this GST number already exists");
        }
        
        // Update fields
        vendor.setName(vendorDetails.getName());
        vendor.setEmail(vendorDetails.getEmail());
        vendor.setPhone(vendorDetails.getPhone());
        vendor.setAddress(vendorDetails.getAddress());
        vendor.setGstNumber(vendorDetails.getGstNumber());
        vendor.setDescription(vendorDetails.getDescription());
        
        return vendorRepository.save(vendor);
    }

    public void deleteVendor(Long id) {
        if (!vendorRepository.existsById(id)) {
            throw new EntityNotFoundException("Vendor not found with id: " + id);
        }
        vendorRepository.deleteById(id);
    }

    public List<Vendor> searchVendors(String name) {
        if (name == null || name.trim().isEmpty()) {
            return getAllVendors();
        }
        return vendorRepository.findByNameContainingIgnoreCase(name.trim());
    }
}