package com.example.customermanagement.model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "invoice_items")
public class InvoiceItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    @JsonBackReference
    private Invoice invoice;
    
    @NotBlank(message = "Item name is required")
    @Column(name = "item_name", nullable = false)
    private String itemName;
    
    @Column(name = "item_description")
    private String itemDescription;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be greater than 0")
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;
    
    @Column(name = "cgst_rate", precision = 5, scale = 2)
    private BigDecimal cgstRate;
    
    @Column(name = "sgst_rate", precision = 5, scale = 2)
    private BigDecimal sgstRate;
    
    @Column(name = "cgst_amount", precision = 10, scale = 2)
    private BigDecimal cgstAmount;
    
    @Column(name = "sgst_amount", precision = 10, scale = 2)
    private BigDecimal sgstAmount;
    
    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;
    
    @NotNull(message = "Total price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total price must be greater than 0")
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;
    
    // Constructors
    public InvoiceItem() {}
    
    public InvoiceItem(String itemName, String itemDescription, Integer quantity, 
                       BigDecimal unitPrice, BigDecimal totalPrice) {
        this.itemName = itemName;
        this.itemDescription = itemDescription;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
    }
    
    // Helper method to calculate tax amounts
    @PrePersist
    @PreUpdate
    public void calculateTaxAmounts() {
        if (unitPrice != null && quantity != null) {
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            
            if (cgstRate != null) {
                cgstAmount = subtotal.multiply(cgstRate).divide(BigDecimal.valueOf(100));
            } else {
                cgstAmount = BigDecimal.ZERO;
            }
            
            if (sgstRate != null) {
                sgstAmount = subtotal.multiply(sgstRate).divide(BigDecimal.valueOf(100));
            } else {
                sgstAmount = BigDecimal.ZERO;
            }
            
            taxAmount = cgstAmount.add(sgstAmount);
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Invoice getInvoice() {
        return invoice;
    }
    
    public void setInvoice(Invoice invoice) {
        this.invoice = invoice;
    }
    
    public String getItemName() {
        return itemName;
    }
    
    public void setItemName(String itemName) {
        this.itemName = itemName;
    }
    
    public String getItemDescription() {
        return itemDescription;
    }
    
    public void setItemDescription(String itemDescription) {
        this.itemDescription = itemDescription;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public BigDecimal getCgstRate() {
        return cgstRate;
    }
    
    public void setCgstRate(BigDecimal cgstRate) {
        this.cgstRate = cgstRate;
    }
    
    public BigDecimal getSgstRate() {
        return sgstRate;
    }
    
    public void setSgstRate(BigDecimal sgstRate) {
        this.sgstRate = sgstRate;
    }
    
    public BigDecimal getCgstAmount() {
        return cgstAmount;
    }
    
    public void setCgstAmount(BigDecimal cgstAmount) {
        this.cgstAmount = cgstAmount;
    }
    
    public BigDecimal getSgstAmount() {
        return sgstAmount;
    }
    
    public void setSgstAmount(BigDecimal sgstAmount) {
        this.sgstAmount = sgstAmount;
    }
    
    public BigDecimal getTaxAmount() {
        return taxAmount;
    }
    
    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }
    
    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
    
    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
}