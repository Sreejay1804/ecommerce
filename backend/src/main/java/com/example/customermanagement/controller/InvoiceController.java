package com.example.customermanagement.controller;

import com.example.customermanagement.model.Invoice;
import com.example.customermanagement.service.InvoiceService;
import com.example.customermanagement.service.WhatsAppService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private WhatsAppService whatsAppService;

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        List<Invoice> invoices = invoiceService.getAllInvoices();
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        try {
            Invoice invoice = invoiceService.getInvoiceById(id);
            return ResponseEntity.ok(invoice);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/number/{invoiceNo}")
    public ResponseEntity<Invoice> getInvoiceByNumber(@PathVariable String invoiceNo) {
        try {
            Invoice invoice = invoiceService.getInvoiceByNumber(invoiceNo);
            return ResponseEntity.ok(invoice);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createInvoice(@Valid @RequestBody Invoice invoice) {
        try {
            Invoice createdInvoice = invoiceService.createInvoice(invoice);
            return new ResponseEntity<>(createdInvoice, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInvoice(@PathVariable Long id, @Valid @RequestBody Invoice invoiceDetails) {
        try {
            Invoice updatedInvoice = invoiceService.updateInvoice(id, invoiceDetails);
            return ResponseEntity.ok(updatedInvoice);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteInvoice(@PathVariable Long id) {
        try {
            invoiceService.deleteInvoice(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invoice deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Invoice>> searchInvoices(@RequestParam String term) {
        List<Invoice> invoices = invoiceService.searchInvoices(term);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/customer")
    public ResponseEntity<List<Invoice>> getInvoicesByCustomerName(@RequestParam String name) {
        List<Invoice> invoices = invoiceService.getInvoicesByCustomerName(name);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/mobile")
    public ResponseEntity<List<Invoice>> getInvoicesByMobile(@RequestParam String mobile) {
        List<Invoice> invoices = invoiceService.getInvoicesByMobile(mobile);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Invoice>> getInvoicesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Invoice> invoices = invoiceService.getInvoicesByDateRange(startDate, endDate);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Invoice>> getRecentInvoices() {
        List<Invoice> invoices = invoiceService.getRecentInvoices();
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/generate-number")
    public ResponseEntity<String> generateInvoiceNumber() {
        String invoiceNumber = invoiceService.generateNextInvoiceNumber();
        return ResponseEntity.ok(invoiceNumber);
    }

    @GetMapping("/check-invoice-no")
    public ResponseEntity<Map<String, Boolean>> checkInvoiceNumberExists(@RequestParam String invoiceNo) {
        boolean exists = invoiceService.existsByInvoiceNumber(invoiceNo);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getInvoiceStats() {
        try {
            Map<String, Object> stats = invoiceService.getInvoiceStatistics();
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateInvoiceStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Invoice updatedInvoice = invoiceService.updateInvoiceStatus(id, status);
            return ResponseEntity.ok(updatedInvoice);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/send-whatsapp")
    public ResponseEntity<?> sendWhatsAppNotification(@PathVariable Long id) {
        try {
            Invoice invoice = invoiceService.getInvoiceById(id);
            if (invoice.getCustomerMobile() == null || invoice.getCustomerMobile().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Customer mobile number is required"));
            }

            boolean sent = whatsAppService.sendInvoiceNotification(invoice);
            if (sent) {
                return ResponseEntity.ok(Map.of("message", "WhatsApp notification sent successfully"));
            } else {
                return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send WhatsApp notification"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}