package com.example.customermanagement.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.customermanagement.model.Invoice;
import com.example.customermanagement.model.InvoiceItem;
import com.example.customermanagement.repository.InvoiceRepository;

import jakarta.validation.ConstraintViolationException;

@Service
@Transactional
public class InvoiceService {
    
    @Autowired
    private InvoiceRepository invoiceRepository;
    
    // Get all invoices
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAllByOrderByInvoiceDateDesc().stream()
            .map(invoice -> {
                // Force initialization of items collection
                invoice.getItems().size();
                return invoice;
            })
            .collect(Collectors.toList());
    }
    
    // Get invoice by ID
    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
    }
    
    // Get invoice by invoice number
    public Invoice getInvoiceByNumber(String invoiceNo) {
        return invoiceRepository.findByInvoiceNo(invoiceNo)
                .orElseThrow(() -> new RuntimeException("Invoice not found with number: " + invoiceNo));
    }
    
    // Create new invoice
    public Invoice createInvoice(Invoice invoice) {
        try {
            // Auto-generate invoice number if not provided
            if (invoice.getInvoiceNo() == null || invoice.getInvoiceNo().trim().isEmpty()) {
                invoice.setInvoiceNo(generateNextInvoiceNumber());
            }
            
            // Validate invoice number uniqueness
            if (invoiceRepository.existsByInvoiceNo(invoice.getInvoiceNo())) {
                throw new RuntimeException("Invoice number already exists: " + invoice.getInvoiceNo());
            }
            
            // Calculate and set tax amounts for each item
            if (invoice.getItems() != null && !invoice.getItems().isEmpty()) {
                for (InvoiceItem item : invoice.getItems()) {
                    calculateItemTotals(item);
                    item.setInvoice(invoice);
                }
                
                // Recalculate total amount using the calculateTotalAmount method
                invoice.calculateTotalAmount();
            } else {
                // If no items, throw error
                throw new IllegalArgumentException("Invoice must contain at least one item");
            }
            
            // Validate before saving
            invoice.validateForPersistence();
            
            return invoiceRepository.save(invoice);
            
        } catch (ConstraintViolationException e) {
            throw new RuntimeException("Validation failed: " + extractValidationMessages(e));
        } catch (Exception e) {
            throw new RuntimeException("Error creating invoice: " + e.getMessage(), e);
        }
    }
    
    // Update invoice
    public Invoice updateInvoice(Long id, Invoice invoiceDetails) {
        try {
            Invoice existingInvoice = getInvoiceById(id);
            
            // Update basic fields
            existingInvoice.setCustomerName(invoiceDetails.getCustomerName());
            existingInvoice.setCustomerMobile(invoiceDetails.getCustomerMobile());
            existingInvoice.setCustomerAddress(invoiceDetails.getCustomerAddress());
            existingInvoice.setInvoiceDate(invoiceDetails.getInvoiceDate());
            existingInvoice.setPaymentStatus(invoiceDetails.getPaymentStatus());
            
            // Update items
            if (invoiceDetails.getItems() != null && !invoiceDetails.getItems().isEmpty()) {
                // Clear existing items
                existingInvoice.clearItems();
                
                // Add new items
                for (InvoiceItem item : invoiceDetails.getItems()) {
                    calculateItemTotals(item);
                    existingInvoice.addItem(item);
                }
                
                // Total will be calculated automatically by addItem method
            } else {
                throw new IllegalArgumentException("Invoice must contain at least one item");
            }
            
            // Validate before saving
            existingInvoice.validateForPersistence();
            
            return invoiceRepository.save(existingInvoice);
            
        } catch (ConstraintViolationException e) {
            throw new RuntimeException("Validation failed: " + extractValidationMessages(e));
        } catch (Exception e) {
            throw new RuntimeException("Error updating invoice: " + e.getMessage(), e);
        }
    }
    
    // Delete invoice
    public void deleteInvoice(Long id) {
        Invoice invoice = getInvoiceById(id);
        invoiceRepository.delete(invoice);
    }
    
    // Search invoices
    public List<Invoice> searchInvoices(String searchTerm) {
        return invoiceRepository.searchInvoices(searchTerm).stream()
            .map(invoice -> {
                // Force initialization of items collection
                invoice.getItems().size();
                return invoice;
            })
            .collect(Collectors.toList());
    }
    
    // Get invoices by customer name
    public List<Invoice> getInvoicesByCustomerName(String customerName) {
        return invoiceRepository.findByCustomerNameContainingIgnoreCase(customerName);
    }
    
    // Get invoices by mobile
    public List<Invoice> getInvoicesByMobile(String mobile) {
        return invoiceRepository.findByCustomerMobile(mobile);
    }
    
    // Get invoices by date range
    public List<Invoice> getInvoicesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return invoiceRepository.findByInvoiceDateBetween(startDate, endDate);
    }
    
    // Get recent invoices (last 30 days)
    public List<Invoice> getRecentInvoices() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return invoiceRepository.findRecentInvoices(thirtyDaysAgo);
    }
    
    // Generate next invoice number
    public String generateNextInvoiceNumber() {
        String latestInvoiceNo = invoiceRepository.findLatestInvoiceNumber().orElse("INV000000");
        
        try {
            // Extract number part from invoice number (assuming format: INV######)
            String numberPart = latestInvoiceNo.substring(3);
            int nextNumber = Integer.parseInt(numberPart) + 1;
            return String.format("INV%06d", nextNumber);
        } catch (Exception e) {
            // If parsing fails, generate based on current date
            String dateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
            return "INV" + dateTime;
        }
    }
    
    // Check if invoice number exists
    public boolean existsByInvoiceNo(String invoiceNo) {
        return invoiceRepository.existsByInvoiceNo(invoiceNo);
    }
    
    // ADDED: Method required by controller (different name)
    public boolean existsByInvoiceNumber(String invoiceNumber) {
        return existsByInvoiceNo(invoiceNumber);
    }
    
    // Get total invoice count
    public Long getTotalInvoiceCount() {
        return invoiceRepository.countAllInvoices();
    }
    
    // Get invoices by payment status
    public List<Invoice> getInvoicesByPaymentStatus(Invoice.PaymentStatus paymentStatus) {
        return invoiceRepository.findByPaymentStatus(paymentStatus);
    }
    
    // Update payment status
    public Invoice updatePaymentStatus(Long id, Invoice.PaymentStatus paymentStatus) {
        Invoice invoice = getInvoiceById(id);
        invoice.setPaymentStatus(paymentStatus);
        return invoiceRepository.save(invoice);
    }
    
    // ADDED: Method required by controller (different signature)
    public Invoice updateInvoiceStatus(Long id, String status) {
        Invoice invoice = getInvoiceById(id);
        try {
            Invoice.PaymentStatus paymentStatus = Invoice.PaymentStatus.valueOf(status.toUpperCase());
            invoice.setPaymentStatus(paymentStatus);
            return invoiceRepository.save(invoice);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid payment status: " + status);
        }
    }
    
    // Get revenue statistics
    public Double getTotalRevenue() {
        return invoiceRepository.getTotalRevenue().orElse(0.0);
    }
    
    public Double getMonthlyRevenue(int year, int month) {
        return invoiceRepository.getMonthlyRevenue(year, month).orElse(0.0);
    }
    
    // ADDED: Method required by controller
    public Map<String, Object> getInvoiceStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        // Total invoices count
        Long totalInvoices = invoiceRepository.count();
        statistics.put("totalInvoices", totalInvoices);
        
        // Total revenue
        Double totalRevenue = getTotalRevenue();
        statistics.put("totalRevenue", totalRevenue);
        
        // Count by payment status using existing repository methods
        try {
            List<Invoice> paidInvoices = invoiceRepository.findByPaymentStatus(Invoice.PaymentStatus.PAID);
            List<Invoice> pendingInvoices = invoiceRepository.findByPaymentStatus(Invoice.PaymentStatus.PENDING);
            List<Invoice> overdueInvoices = invoiceRepository.findByPaymentStatus(Invoice.PaymentStatus.OVERDUE);
            
            statistics.put("paidInvoices", (long) paidInvoices.size());
            statistics.put("pendingInvoices", (long) pendingInvoices.size());
            statistics.put("overdueInvoices", (long) overdueInvoices.size());
        } catch (Exception e) {
            // If repository methods don't exist, provide default values
            statistics.put("paidInvoices", 0L);
            statistics.put("pendingInvoices", 0L);
            statistics.put("overdueInvoices", 0L);
        }
        
        // Recent invoices count (last 30 days)
        try {
            List<Invoice> recentInvoices = getRecentInvoices();
            statistics.put("recentInvoicesCount", (long) recentInvoices.size());
        } catch (Exception e) {
            statistics.put("recentInvoicesCount", 0L);
        }
        
        return statistics;
    }
    
    // Helper method to calculate item totals
    private void calculateItemTotals(InvoiceItem item) {
        // Validate item inputs
        if (item.getUnitPrice() == null || item.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Item unit price must be greater than 0");
        }
        
        if (item.getQuantity() == null || item.getQuantity() <= 0) {
            throw new IllegalArgumentException("Item quantity must be greater than 0");
        }
        
        // FIXED: Check for itemName instead of productName (assuming InvoiceItem has itemName field)
        if (item.getItemName() == null || item.getItemName().trim().isEmpty()) {
            throw new IllegalArgumentException("Item name is required");
        }
        
        BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        
        BigDecimal cgstAmount = BigDecimal.ZERO;
        BigDecimal sgstAmount = BigDecimal.ZERO;
        
        if (item.getCgstRate() != null && item.getCgstRate().compareTo(BigDecimal.ZERO) > 0) {
            cgstAmount = subtotal.multiply(item.getCgstRate()).divide(BigDecimal.valueOf(100));
            item.setCgstAmount(cgstAmount);
        } else {
            item.setCgstAmount(BigDecimal.ZERO);
        }
        
        if (item.getSgstRate() != null && item.getSgstRate().compareTo(BigDecimal.ZERO) > 0) {
            sgstAmount = subtotal.multiply(item.getSgstRate()).divide(BigDecimal.valueOf(100));
            item.setSgstAmount(sgstAmount);
        } else {
            item.setSgstAmount(BigDecimal.ZERO);
        }
        
        BigDecimal taxAmount = cgstAmount.add(sgstAmount);
        item.setTaxAmount(taxAmount);
        
        BigDecimal totalPrice = subtotal.add(taxAmount);
        item.setTotalPrice(totalPrice);
    }
    
    // Helper method to extract validation messages
    private String extractValidationMessages(ConstraintViolationException e) {
        StringBuilder sb = new StringBuilder();
        e.getConstraintViolations().forEach(violation -> {
            if (sb.length() > 0) sb.append(", ");
            sb.append(violation.getPropertyPath()).append(": ").append(violation.getMessage());
        });
        return sb.toString();
    }
}