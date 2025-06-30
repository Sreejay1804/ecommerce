package com.example.customermanagement.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Invoice number is required")
    @Column(name = "invoice_no", unique = true, nullable = false)
    private String invoiceNo;

    @NotBlank(message = "Customer name is required")
    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_mobile")
    private String customerMobile;

    @Column(name = "customer_address", columnDefinition = "TEXT")
    private String customerAddress;

    @NotNull(message = "Invoice date is required")
    @Column(name = "invoice_date", nullable = false)
    private LocalDateTime invoiceDate;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total amount must be greater than 0")
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @NotNull
    @Column(name = "date_time", nullable = false)
    private LocalDateTime dateTime;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JsonManagedReference
    private List<InvoiceItem> items = new ArrayList<>();

    // Constructors
    public Invoice() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.dateTime = LocalDateTime.now();
    }

    public Invoice(String invoiceNo, String customerName, String customerMobile,
                   String customerAddress, LocalDateTime invoiceDate, BigDecimal totalAmount) {
        this();
        this.invoiceNo = invoiceNo;
        this.customerName = customerName;
        this.customerMobile = customerMobile;
        this.customerAddress = customerAddress;
        this.invoiceDate = invoiceDate;
        this.totalAmount = totalAmount;
    }

    // Lifecycle callbacks
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.updatedAt == null) this.updatedAt = LocalDateTime.now();
        if (this.dateTime == null) this.dateTime = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public void addItem(InvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
        calculateTotalAmount();
    }

    public void removeItem(InvoiceItem item) {
        items.remove(item);
        item.setInvoice(null);
        calculateTotalAmount();
    }

    public void clearItems() {
        for (InvoiceItem item : items) {
            item.setInvoice(null);
        }
        items.clear();
        this.totalAmount = BigDecimal.ZERO;
    }

    public void calculateTotalAmount() {
        if (items == null || items.isEmpty()) {
            this.totalAmount = BigDecimal.ZERO;
            return;
        }

        BigDecimal total = items.stream()
            .filter(item -> item.getTotalPrice() != null)
            .map(InvoiceItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalAmount = total;
    }

    public void validateForPersistence() {
        if (this.totalAmount == null || this.totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            calculateTotalAmount();
        }

        if (this.totalAmount == null || this.totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                "Invoice must have at least one item with positive total amount. Current total: " +
                (this.totalAmount != null ? this.totalAmount : "null")
            );
        }

        if (this.items == null || this.items.isEmpty()) {
            throw new IllegalArgumentException("Invoice must contain at least one item");
        }

        for (InvoiceItem item : this.items) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("All items must have positive quantity");
            }
            if (item.getUnitPrice() == null || item.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("All items must have positive unit price");
            }
            if (item.getTotalPrice() == null || item.getTotalPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("All items must have positive total price");
            }
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvoiceNo() {
        return invoiceNo;
    }

    public void setInvoiceNo(String invoiceNo) {
        this.invoiceNo = invoiceNo;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerMobile() {
        return customerMobile;
    }

    public void setCustomerMobile(String customerMobile) {
        this.customerMobile = customerMobile;
    }

    public String getCustomerAddress() {
        return customerAddress;
    }

    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }

    public LocalDateTime getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDateTime invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public List<InvoiceItem> getItems() {
        return items;
    }

    public void setItems(List<InvoiceItem> items) {
        this.items = items != null ? items : new ArrayList<>();
        for (InvoiceItem item : this.items) {
            item.setInvoice(this);
        }
        calculateTotalAmount();
    }

    public enum PaymentStatus {
        PENDING,
        PAID,
        PARTIALLY_PAID,
        CANCELLED,
        OVERDUE
    }
}
