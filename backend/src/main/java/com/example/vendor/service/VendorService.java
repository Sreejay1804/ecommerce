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
        if (vendorRepository.existsByEmail(vendor.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (vendorRepository.existsByPhone(vendor.getPhone())) {
            throw new IllegalArgumentException("Phone number already exists");
        }
        return vendorRepository.save(vendor);
    }

    public Vendor updateVendor(Long id, Vendor vendorDetails) {
        Vendor vendor = getVendorById(id);
        vendor.setName(vendorDetails.getName());
        vendor.setEmail(vendorDetails.getEmail());
        vendor.setPhone(vendorDetails.getPhone());
        vendor.setAddress(vendorDetails.getAddress());
        return vendorRepository.save(vendor);
    }

    public void deleteVendor(Long id) {
        if (!vendorRepository.existsById(id)) {
            throw new EntityNotFoundException("Vendor not found with id: " + id);
        }
        vendorRepository.deleteById(id);
    }

    public List<Vendor> searchVendors(String name) {
        return vendorRepository.findByNameContainingIgnoreCase(name);
    }
}