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
        if (vendorRepository.existsByGstNumber(vendor.getGstNumber())) {
            throw new IllegalArgumentException("GST number already exists");
        }
        return vendorRepository.save(vendor);
    }

    public Vendor updateVendor(Long id, Vendor vendorDetails) {
        Vendor vendor = getVendorById(id);
        vendor.setName(vendorDetails.getName());
        vendor.setAddress(vendorDetails.getAddress());
        vendor.setDescription(vendorDetails.getDescription());
        vendor.setGstNumber(vendorDetails.getGstNumber());
        return vendorRepository.save(vendor);
    }

    public void deleteVendor(Long id) {
        if (!vendorRepository.existsById(id)) {
            throw new EntityNotFoundException("Vendor not found with id: " + id);
        }
        vendorRepository.deleteById(id);
    }

    public List<Vendor> searchVendors(String term) {
        return vendorRepository.findByNameContainingIgnoreCaseOrGstNumberContainingIgnoreCase(term, term);
    }
}