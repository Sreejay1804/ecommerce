package com.example.customermanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.customermanagement.model.VendorInvoice;

@Repository
public interface VendorInvoiceRepository extends JpaRepository<VendorInvoice, Long> {
    
    Optional<VendorInvoice> findByInvoiceNo(String invoiceNo);
    
    List<VendorInvoice> findByVendorId(Long vendorId);
    
    List<VendorInvoice> findByVendorNameContainingIgnoreCase(String vendorName);
    
    List<VendorInvoice> findByVendorPhone(String vendorPhone);
    
    @Query("SELECT vi FROM VendorInvoice vi WHERE vi.dateTime BETWEEN :startDate AND :endDate")
    List<VendorInvoice> findByDateTimeBetween(@Param("startDate") String startDate, @Param("endDate") String endDate);
    
    @Query("SELECT vi FROM VendorInvoice vi JOIN FETCH vi.items WHERE vi.id = :id")
    Optional<VendorInvoice> findByIdWithItems(@Param("id") Long id);
}