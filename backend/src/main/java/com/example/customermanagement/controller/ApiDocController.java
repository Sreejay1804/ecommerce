package com.example.customermanagement.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiDocController {

    @GetMapping("/info")
    public Map<String, Object> getApiInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "Customer & Invoice Management API");
        info.put("version", "1.0.0");
        info.put("description", "REST API for managing customers and invoices");
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("customers", "/api/customers");
        endpoints.put("invoices", "/api/invoices");
        endpoints.put("health", "/api/health");
        
        info.put("endpoints", endpoints);
        return info;
    }

    @GetMapping("/health")
    public Map<String, String> getHealthStatus() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", java.time.LocalDateTime.now().toString());
        return health;
    }
}
