package com.example.customermanagement.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "vendor_invoices")
public class VendorInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Invoice number is required")
    @Column(name = "invoice_no", nullable = false, unique = true)
    private String invoiceNo;

    @NotNull(message = "Vendor ID is required")
    @Column(name = "vendor_id", nullable = false)
    private Long vendorId;

    @NotBlank(message = "Vendor name is required")
    @Column(name = "vendor_name", nullable = false)
    private String vendorName;

    @Column(name = "vendor_address")
    private String vendorAddress;

    @Column(name = "vendor_phone")
    private String vendorPhone;

    @NotBlank(message = "Date time is required")
    @Column(name = "date_time", nullable = false)
    private String dateTime;

    @NotNull(message = "Subtotal is required")
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @NotNull(message = "Total tax is required")
    @Column(name = "total_tax", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalTax;

    @NotNull(message = "Grand total is required")
    @Column(name = "grand_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal grandTotal;

    @OneToMany(mappedBy = "vendorInvoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<VendorInvoiceItem> items;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

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

    public List<VendorInvoiceItem> getItems() { return items; }
    public void setItems(List<VendorInvoiceItem> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}