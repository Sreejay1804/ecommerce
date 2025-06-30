package com.example.customermanagement.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.customermanagement.dto.VendorInvoiceDTO;
import com.example.customermanagement.service.VendorInvoiceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendor-invoices")
@Validated
public class VendorInvoiceController {

    @Autowired
    private VendorInvoiceService vendorInvoiceService;

    @GetMapping
    public ResponseEntity<List<VendorInvoiceDTO>> getAllInvoices() {
        List<VendorInvoiceDTO> invoices = vendorInvoiceService.getAllInvoices();
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorInvoiceDTO> getInvoiceById(@PathVariable Long id) {
        VendorInvoiceDTO invoice = vendorInvoiceService.getInvoiceById(id);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/invoice-no/{invoiceNo}")
    public ResponseEntity<VendorInvoiceDTO> getInvoiceByInvoiceNo(@PathVariable String invoiceNo) {
        VendorInvoiceDTO invoice = vendorInvoiceService.getInvoiceByInvoiceNo(invoiceNo);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<VendorInvoiceDTO>> getInvoicesByVendorId(@PathVariable Long vendorId) {
        List<VendorInvoiceDTO> invoices = vendorInvoiceService.getInvoicesByVendorId(vendorId);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/search")
    public ResponseEntity<List<VendorInvoiceDTO>> getInvoicesByVendorName(@RequestParam String vendorName) {
        List<VendorInvoiceDTO> invoices = vendorInvoiceService.getInvoicesByVendorName(vendorName);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<VendorInvoiceDTO>> getInvoicesByDateRange(
            @RequestParam String startDate, 
            @RequestParam String endDate) {
        List<VendorInvoiceDTO> invoices = vendorInvoiceService.getInvoicesByDateRange(startDate, endDate);
        return ResponseEntity.ok(invoices);
    }

    @PostMapping
    public ResponseEntity<VendorInvoiceDTO> createInvoice(@Valid @RequestBody VendorInvoiceDTO invoiceDTO) {
        VendorInvoiceDTO createdInvoice = vendorInvoiceService.createInvoice(invoiceDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdInvoice);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendorInvoiceDTO> updateInvoice(
            @PathVariable Long id, 
            @Valid @RequestBody VendorInvoiceDTO invoiceDTO) {
        VendorInvoiceDTO updatedInvoice = vendorInvoiceService.updateInvoice(id, invoiceDTO);
        return ResponseEntity.ok(updatedInvoice);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        vendorInvoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}