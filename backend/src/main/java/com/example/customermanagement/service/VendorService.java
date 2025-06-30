package com.example.customermanagement.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.customermanagement.exception.ResourceNotFoundException;
import com.example.customermanagement.model.Vendor;
import com.example.customermanagement.repository.VendorRepository;

@Service
public class VendorService {
    
    @Autowired
    private VendorRepository vendorRepository;

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + id));
    }

    public Vendor createVendor(Vendor vendor) {
        validateVendorData(vendor);
        return vendorRepository.save(vendor);
    }

    public Vendor updateVendor(Long id, Vendor vendorDetails) {
        Vendor vendor = getVendorById(id);
        
        // Only validate changed fields
        if (!vendor.getEmail().equals(vendorDetails.getEmail())) {
            validateEmail(vendorDetails.getEmail());
        }
        if (!vendor.getPhone().equals(vendorDetails.getPhone())) {
            validatePhone(vendorDetails.getPhone());
        }
        if (!vendor.getGstNumber().equals(vendorDetails.getGstNumber())) {
            validateGstNumber(vendorDetails.getGstNumber());
        }

        vendor.setName(vendorDetails.getName());
        vendor.setEmail(vendorDetails.getEmail());
        vendor.setPhone(vendorDetails.getPhone());
        vendor.setAddress(vendorDetails.getAddress());
        vendor.setGstNumber(vendorDetails.getGstNumber());
        
        return vendorRepository.save(vendor);
    }

    public void deleteVendor(Long id) {
        if (vendorRepository.existsById(id)) {
            vendorRepository.deleteById(id);
        } else {
            throw new ResourceNotFoundException("Vendor not found with id: " + id);
        }
    }

    public List<Vendor> searchVendors(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllVendors();
        }
        return vendorRepository.searchVendors(searchTerm.trim());
    }

    private void validateVendorData(Vendor vendor) {
        validateEmail(vendor.getEmail());
        validatePhone(vendor.getPhone());
        validateGstNumber(vendor.getGstNumber());
    }

    private void validateEmail(String email) {
        if (vendorRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }
    }

    private void validatePhone(String phone) {
        if (vendorRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Phone number already exists: " + phone);
        }
    }

    private void validateGstNumber(String gstNumber) {
        if (vendorRepository.existsByGstNumber(gstNumber)) {
            throw new IllegalArgumentException("GST number already exists: " + gstNumber);
        }
    }
}
