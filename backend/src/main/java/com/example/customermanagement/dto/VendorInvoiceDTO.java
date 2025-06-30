package com.example.customermanagement.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class VendorInvoiceDTO {
    private Long id;
    
    @NotBlank(message = "Invoice number is required")
    private String invoiceNo;
    
    @NotNull(message = "Vendor ID is required")
    private Long vendorId;
    
    @NotBlank(message = "Vendor name is required")
    private String vendorName;
    
    private String vendorAddress;
    private String vendorPhone;
    
    @NotBlank(message = "Date time is required")
    private String dateTime;
    
    @NotNull(message = "Subtotal is required")
    private BigDecimal subtotal;
    
    @NotNull(message = "Total tax is required")
    private BigDecimal totalTax;
    
    @NotNull(message = "Grand total is required")
    private BigDecimal grandTotal;
    
    private List<VendorInvoiceItemDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public VendorInvoiceDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorAddress() { return vendorAddress; }
    public void setVendorAddress(String vendorAddress) { this.vendorAddress = vendorAddress; }

    public String getVendorPhone() { return vendorPhone; }
    public void setVendorPhone(String vendorPhone) { this.vendorPhone = vendorPhone; }

    public String getDateTime() { return dateTime; }
    public void setDateTime(String dateTime) { this.dateTime = dateTime; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getTotalTax() { return totalTax; }
    public void setTotalTax(BigDecimal totalTax) { this.totalTax = totalTax; }

    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }

    public List<VendorInvoiceItemDTO> getItems() { return items; }
    public void setItems(List<VendorInvoiceItemDTO> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}