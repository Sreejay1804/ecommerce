package com.example.customermanagement.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.customermanagement.model.Invoice;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    // Find invoice by invoice number
    Optional<Invoice> findByInvoiceNo(String invoiceNo);
    
    // Check if invoice number exists
    boolean existsByInvoiceNo(String invoiceNo);
    
    // Find invoices by customer name (case insensitive)
    @Query("SELECT i FROM Invoice i WHERE LOWER(i.customerName) LIKE LOWER(CONCAT('%', :customerName, '%'))")
    List<Invoice> findByCustomerNameContainingIgnoreCase(@Param("customerName") String customerName);
    
    // Find invoices by customer mobile
    List<Invoice> findByCustomerMobile(String customerMobile);
    
    // Find invoices within date range
    @Query("SELECT i FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate ORDER BY i.invoiceDate DESC")
    List<Invoice> findByInvoiceDateBetween(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    // Find recent invoices (last 30 days)
    @Query("SELECT i FROM Invoice i WHERE i.invoiceDate >= :thirtyDaysAgo ORDER BY i.invoiceDate DESC")
    List<Invoice> findRecentInvoices(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    
    // Search invoices by term (invoice number, customer name, or mobile)
    @Query("SELECT DISTINCT i FROM Invoice i LEFT JOIN FETCH i.items WHERE " +
           "LOWER(i.invoiceNo) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.customerName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "i.customerMobile LIKE CONCAT('%', :searchTerm, '%')")
    List<Invoice> searchInvoices(@Param("searchTerm") String searchTerm);
    
    // Find all invoices ordered by date (newest first)
    @Query("SELECT DISTINCT i FROM Invoice i LEFT JOIN FETCH i.items ORDER BY i.invoiceDate DESC")
    List<Invoice> findAllByOrderByInvoiceDateDesc();
    
    // Find invoices by payment status
    List<Invoice> findByPaymentStatus(Invoice.PaymentStatus paymentStatus);
    
    // Get invoice count
    @Query("SELECT COUNT(i) FROM Invoice i")
    Long countAllInvoices();
    
    // Find latest invoice number for auto-generation
    @Query("SELECT i.invoiceNo FROM Invoice i ORDER BY i.id DESC LIMIT 1")
    Optional<String> findLatestInvoiceNumber();
    
    // Get total revenue
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.paymentStatus = 'PAID'")
    Optional<Double> getTotalRevenue();
    
    // Get monthly revenue
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE " +
           "i.paymentStatus = 'PAID' AND " +
           "YEAR(i.invoiceDate) = :year AND MONTH(i.invoiceDate) = :month")
    Optional<Double> getMonthlyRevenue(@Param("year") int year, @Param("month") int month);
}