package com.example.customermanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.customermanagement.model.VendorInvoiceItem;

@Repository
public interface VendorInvoiceItemRepository extends JpaRepository<VendorInvoiceItem, Long> {
    
    List<VendorInvoiceItem> findByVendorInvoiceId(Long vendorInvoiceId);
    
    List<VendorInvoiceItem> findByProductId(Long productId);
    
    List<VendorInvoiceItem> findByCategory(String category);
    
    @Query("SELECT vii FROM VendorInvoiceItem vii WHERE vii.vendorInvoice.vendorId = :vendorId")
    List<VendorInvoiceItem> findByVendorId(@Param("vendorId") Long vendorId);
}